import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const REFERRAL_IMG = 'https://img.icons8.com/fluency/256/coin-in-hand.png';
const DAILY_REFERRAL_URL = 'https://tma-referral-worker.shahadathakhand7.workers.dev/api/daily-referral-count';
const REFERRAL_BOT = 'https://t.me/Censorcoin_bot?start=';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const;

type ProfileLanguage = (typeof LANGUAGES)[number]['code'];

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
  const currentLanguage = LANGUAGES.find((l) => l.code === user.language) || LANGUAGES[0];
  const walletCooldownDays = user.ton_address ? daysSince(user.last_ton_address_change) : Infinity;
  const walletLocked = user.ton_address && walletCooldownDays < 14;

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

  const handleLangChange = async (lang: ProfileLanguage) => {
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
      value: currentLanguage.label,
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
    <div className="min-h-screen bg-[#0D0D0D] px-5 pb-8 pt-8">
      <Dialog open={langModal} onOpenChange={setLangModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[430px] rounded-3xl border-white/10 bg-[#1C1C1E] p-0 text-white shadow-2xl">
          <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-white/10 px-5 py-4 text-left">
            <DialogTitle className="text-base font-bold text-white">{t('profile.selectLanguage')}</DialogTitle>
            <ButtonTap onClick={() => setLangModal(false)} className="h-9 w-9 rounded-full bg-white/10 text-white/70">
              <X size={18} />
            </ButtonTap>
          </DialogHeader>
          <div className="flex flex-col gap-2 p-4">
            {LANGUAGES.map(({ code, label, flag }) => (
              <ButtonTap
                key={code}
                onClick={() => handleLangChange(code)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 transition-all ${
                  user.language === code
                    ? 'border-amber-400/50 bg-amber-400/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <span className="text-2xl">{flag}</span>
                <span className={`flex-1 text-left text-sm font-semibold ${user.language === code ? 'text-amber-400' : 'text-white'}`}>
                  {label}
                </span>
                {user.language === code && <Check size={16} weight="bold" className="text-amber-400" />}
              </ButtonTap>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={walletModal} onOpenChange={setWalletModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[430px] rounded-3xl border-white/10 bg-[#1C1C1E] p-0 text-white shadow-2xl">
          <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-white/10 px-5 py-4 text-left">
            <DialogTitle className="text-base font-bold text-white">{t('profile.editWallet')}</DialogTitle>
            <ButtonTap onClick={() => setWalletModal(false)} className="h-9 w-9 rounded-full bg-white/10 text-white/70">
              <X size={18} />
            </ButtonTap>
          </DialogHeader>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider text-white/50">
                {t('profile.walletAddress')}
              </label>
              <Input
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder={t('profile.walletPlaceholder')}
                className="h-12 rounded-xl border-white/10 bg-[#0D0D0D] px-4 font-mono text-sm text-white placeholder:text-white/20 focus-visible:ring-amber-400/40"
              />
            </div>
            {walletLocked && (
              <Card className="border-yellow-500/20 bg-yellow-500/10 shadow-none">
                <CardContent className="p-4">
                  <p className="text-xs leading-relaxed text-yellow-400">
                    {t('profile.walletCooldown', { days: 14 - walletCooldownDays })}
                  </p>
                </CardContent>
              </Card>
            )}
            <ButtonTap onClick={handleSaveWallet} className="w-full rounded-xl bg-amber-400 py-4 text-sm font-bold text-black">
              {t('profile.save')}
            </ButtonTap>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-5">
        <Card className="overflow-hidden rounded-3xl border-amber-400/20 bg-gradient-to-br from-[#1A1A1A] to-[#111111] shadow-2xl shadow-amber-400/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 rounded-3xl border-2 border-amber-400/40 shadow-lg">
                {user.profile_photo_url && <AvatarImage src={user.profile_photo_url} alt="Profile" className="object-cover" />}
                <AvatarFallback className="rounded-3xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 text-2xl font-black text-amber-400">
                  {(user.first_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-400/70">Censor Coin Profile</p>
                <h2 className="mt-1 truncate text-2xl font-black text-white">{user.first_name || 'Censor User'}</h2>
                {user.username && <p className="text-sm text-white/45">@{user.username}</p>}
                <p className="mt-2 text-xs font-semibold text-white/40">TON: {user.ton_address ? maskAddress(user.ton_address) : t('profile.notConnected')}</p>
              </div>
            </div>
            <Separator className="my-5 bg-white/10" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70">Balance</p>
                <p className="mt-1 text-xl font-black text-white">{user.total_points.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-blue-400/15 bg-blue-400/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400/70">Referrals</p>
                <p className="mt-1 text-xl font-black text-white">{user.total_refers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {settingsCards.map(({ icon: Icon, label, value, onClick, color, bg, border }) => (
            <Card key={label} className={`rounded-3xl bg-[#1A1A1A] shadow-none ${border}`}>
              <CardContent className="p-0">
                <ButtonTap onClick={onClick} className="flex w-full items-center gap-4 p-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${bg}`}>
                    <Icon size={21} weight="thin" className={color} />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs text-white/45">{label}</p>
                    <p className="mt-0.5 truncate text-sm font-bold text-white">{value}</p>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-white/20" />
                </ButtonTap>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl border-white/10 bg-[#1A1A1A] shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">{t('profile.referralSection')}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/40">Invite friends and earn 6,000 coins per referral</p>
              </div>
              <motion.img
                src={REFERRAL_IMG}
                alt="Referral"
                className="h-16 w-16 object-contain drop-shadow-xl select-none"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                draggable={false}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-blue-400/15 bg-blue-400/10 p-4">
                <Users size={18} weight="thin" className="text-blue-400" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/40">{t('profile.totalRefers')}</p>
                <p className="mt-1 text-xl font-black text-white">{user.total_refers}</p>
              </div>
              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-4">
                <CurrencyCircleDollar size={18} weight="thin" className="text-amber-400" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/40">{t('profile.referralEarnings')}</p>
                <p className="mt-1 text-xl font-black text-white">{(user.total_refers * 6000).toLocaleString()}</p>
              </div>
            </div>
            <Separator className="my-5 bg-white/10" />
            <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-white/40">{t('profile.referralLink')}</p>
              <p className="mt-3 break-all font-mono text-xs leading-relaxed text-amber-400/85">
                {user.referral_code ? referralLink : 'Complete registration to get your link'}
              </p>
              {user.referral_code && (
                <ButtonTap onClick={handleCopy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 py-3.5">
                  {copied ? (
                    <>
                      <Check size={16} weight="bold" className="text-green-400" />
                      <span className="text-sm font-semibold text-green-400">{t('profile.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} weight="thin" className="text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">{t('profile.copyLink')}</span>
                    </>
                  )}
                </ButtonTap>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3">
          <Card className="rounded-3xl border-green-400/15 bg-[#1A1A1A] shadow-none">
            <CardContent className="p-0">
              <ButtonTap onClick={() => window.open('https://censorcoin.io/privacy', '_blank')} className="flex w-full items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-400/10">
                  <ShieldCheck size={21} weight="thin" className="text-green-400" />
                </div>
                <p className="flex-1 text-left text-sm font-bold text-white">{t('profile.privacy')}</p>
                <CaretRight size={16} className="text-white/20" />
              </ButtonTap>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-blue-400/15 bg-[#1A1A1A] shadow-none">
            <CardContent className="p-0">
              <ButtonTap onClick={() => window.open('https://censorcoin.io/terms', '_blank')} className="flex w-full items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-400/10">
                  <FileText size={21} weight="thin" className="text-blue-400" />
                </div>
                <p className="flex-1 text-left text-sm font-bold text-white">{t('profile.terms')}</p>
                <CaretRight size={16} className="text-white/20" />
              </ButtonTap>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
