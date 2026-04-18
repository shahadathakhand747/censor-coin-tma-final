import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TelegramLogo, ShieldCheck, ArrowRight, DeviceMobile } from '@phosphor-icons/react';
import { useUser } from '../context/UserContext';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';
import ButtonTap from '../components/ButtonTap';

const VERIFY_URL = 'https://telegram-membership-bot-kwq6.onrender.com/verify';
const REGISTER_URL = 'https://tma-referral-worker.shahadathakhand7.workers.dev/api/register';
const CHANNEL_ID = '-1003925758863';
const TG_CHANNEL = 'https://t.me/censorcoin';

export default function VerifyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { webApp, user: tgUser, isBrowserMode, startParam } = useTelegramWebApp();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);

  const handleJoin = () => {
    if (webApp && typeof (webApp as unknown as { openLink?: (url: string) => void }).openLink === 'function') {
      (webApp as unknown as { openLink: (url: string) => void }).openLink(TG_CHANNEL);
    } else {
      window.open(TG_CHANNEL, '_blank');
    }
  };

  const handleVerify = async () => {
    const userId = tgUser?.id;
    if (!userId) {
      toast({
        title: t('common.error'),
        description: 'No Telegram user found. Open via Telegram.',
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, channel_username: CHANNEL_ID }),
      });
      const data = await res.json();

      if (!data.is_member) {
        toast({ title: t('verify.notMember'), variant: 'destructive' });
        setVerifying(false);
        return;
      }

      await updateUser({ membership_verified: true });

      if (user.reg_status !== 'registered') {
        try {
          const regRes = await fetch(REGISTER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegram_id: userId,
              username: tgUser?.username || '',
              first_name: tgUser?.first_name || '',
              referral_code_used: startParam || null,
            }),
          });
          const regData = await regRes.json();
          await updateUser({
            reg_status: 'registered',
            referral_code: regData.referral_code || '',
            username: tgUser?.username || '',
            first_name: tgUser?.first_name || '',
            profile_photo_url: tgUser?.photo_url || null,
          });
        } catch (regErr) {
          console.error('[CensorCoin] Registration failed:', regErr);
        }
      }

      toast({ title: t('verify.success') });
      navigate('/home');
    } catch {
      toast({ title: t('verify.error'), variant: 'destructive' });
      setVerifying(false);
    }
  };

  const handleBrowserBypass = async () => {
    await updateUser({
      membership_verified: true,
      reg_status: 'registered',
      first_name: 'Browser User',
      username: 'browser_dev',
      referral_code: 'DEVTEST',
    });
    navigate('/home');
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D0D] flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 p-7 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 flex items-center justify-center">
            <ShieldCheck size={36} weight="duotone" className="text-amber-400" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{t('verify.title')}</h2>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              {t('verify.description')}
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <ButtonTap
              onClick={handleJoin}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#229ED9] text-white font-semibold text-sm"
            >
              <TelegramLogo size={20} weight="fill" />
              {t('verify.joinBtn')}
            </ButtonTap>

            <ButtonTap
              onClick={handleVerify}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-amber-400 text-black font-semibold text-sm disabled:opacity-60"
            >
              {verifying ? (
                <span className="animate-pulse">{t('verify.verifying')}</span>
              ) : (
                <>
                  {t('verify.verifyBtn')}
                  <ArrowRight size={18} weight="bold" />
                </>
              )}
            </ButtonTap>

            {isBrowserMode && (
              <ButtonTap
                onClick={handleBrowserBypass}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/8 border border-white/15 text-white/60 font-medium text-xs"
              >
                <DeviceMobile size={16} weight="thin" />
                Continue in Browser (Dev Preview)
              </ButtonTap>
            )}
          </div>

          {isBrowserMode && (
            <p className="text-white/25 text-[10px] text-center leading-relaxed">
              Running outside Telegram · verification skippable in dev mode
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
