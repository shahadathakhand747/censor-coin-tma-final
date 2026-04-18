import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  CensorCoinUserState,
  DEFAULT_USER_STATE,
  CLOUD_STORAGE_KEY,
  MAX_STORAGE_SIZE,
} from '../types';
import { useCloudStorage, useTelegramWebApp } from '../hooks/useTelegramWebApp';
import i18n from '../i18n/i18n';

interface UserContextType {
  user: CensorCoinUserState;
  updateUser: (updates: Partial<CensorCoinUserState>) => Promise<void>;
  isLoaded: boolean;
  todayDateBD: string;
  isBrowserMode: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

function getBangladeshDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CensorCoinUserState>(DEFAULT_USER_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const { getItem, setItem } = useCloudStorage();
  const { user: tgUser, isBrowserMode } = useTelegramWebApp();
  const writeMutex = useRef(false);
  const writeQueue = useRef<Partial<CensorCoinUserState>[]>([]);
  const currentUserRef = useRef<CensorCoinUserState>(DEFAULT_USER_STATE);
  const todayDateBD = getBangladeshDate();

  useEffect(() => {
    async function loadUser() {
      try {
        const raw = await getItem(CLOUD_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CensorCoinUserState;
          let updated = { ...parsed };

          // Daily reset: reset tasks/claims if we haven't reset today
          if (parsed.last_daily_reset !== todayDateBD) {
            updated.today_tasks_completed = 0;
            updated.claim_codes_used = [];
            updated.last_daily_reset = todayDateBD;
          }

          if (parsed.language && parsed.language !== i18n.language) {
            i18n.changeLanguage(parsed.language);
          }

          currentUserRef.current = updated;
          setUser(updated);
        } else {
          const initial: CensorCoinUserState = {
            ...DEFAULT_USER_STATE,
            first_name: tgUser?.first_name || '',
            username: tgUser?.username || '',
            profile_photo_url: tgUser?.photo_url || null,
            last_daily_reset: todayDateBD,
          };
          currentUserRef.current = initial;
          setUser(initial);
        }
      } catch {
        currentUserRef.current = DEFAULT_USER_STATE;
        setUser(DEFAULT_USER_STATE);
      } finally {
        setIsLoaded(true);
      }
    }
    loadUser();
  }, []);

  const flushQueue = useCallback(async () => {
    if (writeMutex.current || writeQueue.current.length === 0) return;
    writeMutex.current = true;

    const merged = writeQueue.current.reduce((acc, u) => ({ ...acc, ...u }), {});
    writeQueue.current = [];

    const nextState = { ...currentUserRef.current, ...merged };
    const serialized = JSON.stringify(nextState);

    if (serialized.length > MAX_STORAGE_SIZE) {
      console.error('[CensorCoin] CloudStorage size exceeded 4096 bytes. Aborting write.');
      writeMutex.current = false;
      return;
    }

    try {
      await setItem(CLOUD_STORAGE_KEY, serialized);
    } catch (e) {
      console.error('[CensorCoin] CloudStorage write failed', e);
    }

    writeMutex.current = false;

    // Flush any queued writes that arrived during the write
    if (writeQueue.current.length > 0) {
      flushQueue();
    }
  }, [setItem]);

  const updateUser = useCallback(
    async (updates: Partial<CensorCoinUserState>) => {
      setUser((prev) => {
        const next = { ...prev, ...updates };
        currentUserRef.current = next;
        writeQueue.current.push(updates);
        return next;
      });
      // Flush asynchronously so React state update completes first
      setTimeout(() => flushQueue(), 0);
    },
    [flushQueue],
  );

  return (
    <UserContext.Provider value={{ user, updateUser, isLoaded, todayDateBD, isBrowserMode }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
