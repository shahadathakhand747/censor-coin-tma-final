import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import i18n from '../i18n/i18n';
import {
  Globe, VideoCamera, Wallet, Copy, Check,
  ShieldCheck, FileText, CaretRight, X,
  Users, CurrencyCircleDollar,
} from '@phosphor-icons/react';
import { useUser } from '../context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '../hooks/useSoundEffects';
import ButtonTap from '../components/ButtonTap';

// Icons8 Fluency — free CDN, transparent background
const REFERRAL_IMG = 'https://img.icons8.com/fluency/256/coin-in-hand.png';

const DAILY_REFERRAL_URL = 'https://tma-referral-worker.shahadathakhand7.workers.dev/api/daily-referral-count';
const REFERRAL_BOT = 'https://t.me/Censorcoin_bot?start=';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
] as const;

function getBangladeshDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
}

function daysSince(isoDate: string): number {
  if (!isoDate) return Infinity;
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function maskAddress(addr: string): string {
  if (!addr) return '';
  if (addr.length <= 12) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-6);
}

// Reusable bottom-sheet modal wrapper
function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full bg-[#1C1C1E] rounded-t-3xl border-t border-white/10 p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const { playSound } = useSoundEffects();

  const [langModal, setLangModal] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  const [walletInput, setWalletInput] = useState(user.ton_address || '');
  const [copied, setCopied] = useState(false);

  const referralLink = `${REFERRAL_BOT}${user.referral_code}`;

  const openModal = (fn: () => void) => {
    playSound('modal');
    fn();
  };

  useEffect(() => {
    async function checkReferrals() {
      const todayBD = getBangladeshDate();
      if (user.last_referral_check_date === todayBD) return;
      const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!tgUserId) return;
      try {
        const res = await fetch(`${DAILY_REFERRAL_URL}?telegram_id=${tgUserId}`);
        const data = await res.json();
        const count = data.count ?? 0;
        await updateUser({
          total_refers: count,
          total_points: user.total_points + count * 6000,
          last_referral_check_date: todayBD,
        });
      } catch {
      }
    }
    checkReferrals();
  }, []);

  const handleLangChange = async (lang: 'en' | 'bn' | 'hi' | 'es' | 'ar' | 'de') => {
    await i18n.changeLanguage(lang);
    await updateUser({ language: lang });
    setLangModal(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      playSound('success');
      setTimeout(() => setCopied(false), 2000);
      toast({ title: t('profile.copied') });
    } catch {}
  };

  const handleSaveWallet = async () => {
    if (!walletInput.trim()) {
      playSound('error');
      toast({ title: t('profile.walletInvalid'), variant: 'destructive' });
      return;
    }
    const days = daysSince(user.last_ton_address_change);
    if (user.ton_address && days < 14) {
      playSound('error');
      toast({
        title: t('profile.walletCooldown', { days: 14 - days }),
        variant: 'destructive',
      });
      return;
    }
    await updateUser({
      ton_address: walletInput.trim(),
      last_ton_address_change: new Date().toISOString(),
    });
    playSound('success');
    setWalletModal(false);
    toast({ title: t('profile.walletSaved') });
  };

  const settingsCards = [
    {
      icon: Globe,
      label: t('profile.language'),
      value: LANGUAGES.find((l) => l.code === user.language)?.label || 'English',
      onClick: () => openModal(() => setLangModal(true)),
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
    },
    {
      icon: VideoCamera,
      label: t('profile.tutorial'),
      value: 'YouTube Guide',
      onClick: () => window.open('https://youtube.com/@censorcoin', '_blank'),
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
    },
    {
      icon: Wallet,
      label: t('profile.editWallet'),
      value: user.ton_address ? maskAddress(user.ton_address) : t('profile.notConnected'),
      onClick: () => openModal(() => {
        setWalletInput(user.ton_address || '');
        setWalletModal(true);
      }),
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-8">

      {/* ── Language Modal ── */}
      <BottomSheet open={langModal} onClose={() => setLangModal(false)}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">{t('profile.selectLanguage')}</h3>
          <ButtonTap
            onClick={() => setLangModal(false)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X size={18} className="text-white/70" />
          </ButtonTap>
        </div>
        <div className="flex flex-col gap-2.5">
          {LANGUAGES.map(({ code, label, flag }) => (
            <ButtonTap
              key={code}
              onClick={() => handleLangChange(code)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                user.language === code
                  ? 'border-amber-400/50 bg-amber-400/10'
                  : 'border-white/8 bg-white/5'
              }`}
            >
              <span className="text-2xl">{flag}</span>
              <span
                className={`font-semibold text-sm flex-1 text-left ${
                  user.language === code ? 'text-amber-400' : 'text-white'
                }`}
              >
                {label}
              </span>
              {user.language === code && (
                <Check size={16} weight="bold" className="text-amber-400" />
              )}
            </ButtonTap>
          ))}
        </div>
      </BottomSheet>

      {/* ── Wallet Modal ── */}
      <BottomSheet open={walletModal} onClose={() => setWalletModal(false)}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">{t('profile.editWallet')}</h3>
          <ButtonTap
            onClick={() => setWalletModal(false)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X size={18} className="text-white/70" />
          </ButtonTap>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs uppercase tracking-wider font-medium">
              {t('profile.walletAddress')}
            </label>
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder={t('profile.walletPlaceholder')}
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-amber-400/50 placeholder:text-white/20 transition-colors"
            />
          </div>
          {user.ton_address && daysSince(user.last_ton_address_change) < 14 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-yellow-400 text-base">⚠️</span>
              <p className="text-yellow-400 text-xs leading-relaxed">
                {t('profile.walletCooldown', {
                  days: 14 - daysSince(user.last_ton_address_change),
                })}
              </p>
            </div>
          )}
          <ButtonTap
            onClick={handleSaveWallet}
            className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold text-sm"
          >
            {t('profile.save')}
          </ButtonTap>
        </div>
      </BottomSheet>

      {/* ── Profile Header ── */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-4">
          {user.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt="Profile"
              className="w-16 h-16 rounded-2xl border-2 border-amber-400/40 object-cover shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 flex items-center justify-center text-amber-400 font-black text-2xl border-2 border-amber-400/30 shadow-lg">
              {(user.first_name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-xl truncate">
              {user.first_name || 'Censor User'}
            </h2>
            {user.username && (
              <p className="text-white/40 text-sm">@{user.username}</p>
            )}
            <p className="text-amber-400 font-bold text-base mt-0.5">
              {user.total_points.toLocaleString()} coins
            </p>
          </div>
        </div>
      </div>

      {/* ── Settings Cards ── */}
      <div className="px-5 flex flex-col gap-2.5">
        {settingsCards.map(({ icon: Icon, label, value, onClick, color, bg, border }) => (
          <ButtonTap
            key={label}
            onClick={onClick}
            className={`w-full bg-[#1A1A1A] rounded-2xl border ${border} p-4 flex items-center gap-4`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={20} weight="thin" className={color} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white/50 text-xs">{label}</p>
              <p className="text-white font-semibold text-sm mt-0.5 truncate">
                {value}
              </p>
            </div>
            <CaretRight size={16} className="text-white/20 shrink-0" />
          </ButtonTap>
        ))}
      </div>

      {/* ── Referral Section ── */}
      <div className="px-5 pt-8">
        <h3 className="text-white font-black text-xl mb-1">{t('profile.referralSection')}</h3>
        <p className="text-white/40 text-xs mb-4">Invite friends and earn 6,000 coins per referral</p>

        <div className="flex justify-center py-3">
          <motion.img
            src={REFERRAL_IMG}
            alt="Referral"
            className="w-20 h-20 object-contain drop-shadow-xl select-none"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            draggable={false}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#1A1A1A] rounded-2xl border border-blue-400/15 p-4 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <Users size={18} weight="thin" className="text-blue-400" />
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">{t('profile.totalRefers')}</p>
              <p className="text-white font-bold text-xl mt-0.5">{user.total_refers}</p>
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl border border-amber-400/15 p-4 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <CurrencyCircleDollar size={18} weight="thin" className="text-amber-400" />
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">{t('profile.referralEarnings')}</p>
              <p className="text-white font-bold text-xl mt-0.5">
                {(user.total_refers * 6000).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl border border-white/8 p-4 flex flex-col gap-3">
          <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
            {t('profile.referralLink')}
          </p>
          <p className="text-amber-400/80 text-xs font-mono break-all leading-relaxed">
            {user.referral_code ? referralLink : 'Complete registration to get your link'}
          </p>
          {user.referral_code && (
            <ButtonTap
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 transition-all active:bg-amber-400/20"
            >
              {copied ? (
                <>
                  <Check size={16} weight="bold" className="text-green-400" />
                  <span className="text-green-400 text-sm font-semibold">{t('profile.copied')}</span>
                </>
              ) : (
                <>
                  <Copy size={16} weight="thin" className="text-amber-400" />
                  <span className="text-amber-400 text-sm font-semibold">{t('profile.copyLink')}</span>
                </>
              )}
            </ButtonTap>
          )}
        </div>
      </div>

      {/* ── Legal Links ── */}
      <div className="px-5 pt-6 flex flex-col gap-2.5">
        <ButtonTap
          onClick={() => window.open('https://censorcoin.io/privacy', '_blank')}
          className="w-full bg-[#1A1A1A] rounded-2xl border border-white/8 p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} weight="thin" className="text-green-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold text-sm">{t('profile.privacy')}</p>
          </div>
          <CaretRight size={16} className="text-white/20 shrink-0" />
        </ButtonTap>

        <ButtonTap
          onClick={() => window.open('https://censorcoin.io/terms', '_blank')}
          className="w-full bg-[#1A1A1A] rounded-2xl border border-white/8 p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center shrink-0">
            <FileText size={20} weight="thin" className="text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold text-sm">{t('profile.terms')}</p>
          </div>
          <CaretRight size={16} className="text-white/20 shrink-0" />
        </ButtonTap>
      </div>
    </div>
  );
}
