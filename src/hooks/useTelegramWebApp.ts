/**
 * Telegram Mini App hooks.
 *
 * The Telegram WebApp object is injected at runtime by the Telegram client as
 * `window.Telegram.WebApp`.  We access it directly — no third-party SDK wrapper
 * needed for the functionality we use.
 *
 * `@telegram-apps/sdk-react` is kept as a dependency but only used for its
 * `useLaunchParams` helper where convenient.
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        close: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        CloudStorage: {
          getItem: (key: string, cb: (err: Error | null, val?: string) => void) => void;
          setItem: (key: string, val: string, cb?: (err: Error | null) => void) => void;
          removeItem: (key: string, cb?: (err: Error | null) => void) => void;
        };
        openLink: (url: string, opts?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        showPopup?: (params: object) => void;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          enable: () => void;
          disable: () => void;
          isVisible: boolean;
          isActive: boolean;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          isVisible: boolean;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
    OnClickA?: {
      showRewardedAd: (opts: {
        adCode: string | number;
        onComplete: () => void;
        onError?: (err: unknown) => void;
      }) => void;
    };
    show_10883491?: (format?: string) => Promise<void>;
  }
}

type TelegramWebAppType = NonNullable<NonNullable<Window['Telegram']>['WebApp']>;

function getTelegramWebApp(): TelegramWebAppType | null {
  try {
    return window.Telegram?.WebApp ?? null;
  } catch {
    return null;
  }
}

export function useTelegramWebApp() {
  const webApp = getTelegramWebApp();

  if (!webApp) {
    return {
      webApp: null,
      user: null,
      isReady: true,
      isBrowserMode: true,
      startParam: undefined as string | undefined,
    };
  }

  const tgUser = webApp.initDataUnsafe?.user;
  const user: TelegramUser | null = tgUser
    ? {
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        username: tgUser.username,
        photo_url: tgUser.photo_url,
        language_code: tgUser.language_code,
      }
    : null;

  return {
    webApp,
    user,
    isReady: true,
    isBrowserMode: !tgUser,
    startParam: webApp.initDataUnsafe?.start_param,
  };
}

export function useCloudStorage() {
  const webApp = getTelegramWebApp();
  const cloudStorage = webApp?.CloudStorage ?? null;

  const getItem = (key: string): Promise<string | null> => {
    if (cloudStorage) {
      return new Promise((resolve) => {
        cloudStorage.getItem(key, (err: Error | null, val?: string) => {
          if (err || val === undefined) {
            resolve(localStorage.getItem(key));
          } else {
            resolve(val);
          }
        });
      });
    }
    return Promise.resolve(localStorage.getItem(key));
  };

  const setItem = (key: string, value: string): Promise<void> => {
    if (cloudStorage) {
      return new Promise((resolve) => {
        cloudStorage.setItem(key, value, (_err: Error | null) => {
          resolve();
        });
      });
    }
    localStorage.setItem(key, value);
    return Promise.resolve();
  };

  const removeItem = (key: string): Promise<void> => {
    if (cloudStorage) {
      return new Promise((resolve) => {
        cloudStorage.removeItem(key, (_err: Error | null) => {
          resolve();
        });
      });
    }
    localStorage.removeItem(key);
    return Promise.resolve();
  };

  return { getItem, setItem, removeItem };
}
