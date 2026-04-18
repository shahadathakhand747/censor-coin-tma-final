import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import createAdHandler from 'monetag-tg-sdk';
import {
  Eye, CheckCircle, Lock, YoutubeLogo, TiktokLogo,
  X, ArrowRight, Lightning, Medal, Star, Ticket,
} from '@phosphor-icons/react';
import { useUser } from '../context/UserContext';
import { useToast } from '@/hooks/use-toast';
import ButtonTap from '../components/ButtonTap';
import AdComponent from '../components/AdComponent';
import { ALLOWED_CLAIM_PREFIXES } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { Input } from '@/components/ui/input';

// Icons8 3D Fluency — free CDN, transparent background
const TASK_IMG     = 'https://img.icons8.com/3d-fluency/128/binoculars.png';
const COIN_IMG_3D  = 'https://img.icons8.com/3d-fluency/128/bitcoin.png';
const MEDAL_IMG    = 'https://img.icons8.com/3d-fluency/128/medal.png';
const YOUTUBE_IMG  = 'https://img.icons8.com/3d-fluency/128/youtube.png';
const TIKTOK_IMG   = 'https://img.icons8.com/3d-fluency/128/tiktok.png';

// Lottie CDN URL for reward celebration animation (LottieFiles — Lottie Simple License)
const REWARD_LOTTIE_URL = 'https://assets3.lottiefiles.com/packages/lf20_xTyGda.json';
const adHandler = createAdHandler(10883491);

function getBangladeshDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
}

function formatDateForCode(): string {
  return getBangladeshDate().replace(/-/g, '');
}

// ── Full-Screen Lottie Reward Overlay ─────────────────────────────────────────
function CoinRewardOverlay({
  amount,
  onDone,
  lottieData,
}: {
  amount: number;
  onDone: () => void;
  lottieData: object | null;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-none"
    >
      {/* Lottie confetti/burst behind the coin */}
      {lottieData && (
        <div className="absolute inset-0 flex items-center justify-center opacity-80">
          <div className="w-full h-full max-w-sm">
            <Lottie animationData={lottieData} loop={false} autoplay />
          </div>
        </div>
      )}

      <motion.div
        initial={{ scale: 0.4, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        className="relative flex flex-col items-center gap-5 z-10"
      >
        {/* 3D Coin icon */}
        <motion.div
          animate={{ rotate: [0, 12, -12, 8, -8, 0], scale: [1, 1.18, 1] }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-full bg-amber-400/15 flex items-center justify-center border-2 border-amber-400/40 shadow-2xl shadow-amber-400/30"
        >
          <img
            src={COIN_IMG_3D}
            alt="coin"
            className="w-20 h-20 object-contain drop-shadow-2xl select-none"
            draggable={false}
          />
        </motion.div>

        <div className="text-center">
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 0.4 }}
            className="text-amber-400 text-5xl font-black tracking-tight"
          >
            +{amount.toLocaleString()}
          </motion.p>
          <p className="text-white/60 text-sm mt-2 font-semibold tracking-widest uppercase">
            Coins Earned
          </p>
        </div>

        {/* Particle burst */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? '#FBBF24' : '#FDE68A',
            }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos((i / 10) * 2 * Math.PI) * 100,
              y: Math.sin((i / 10) * 2 * Math.PI) * 100,
              scale: 0,
            }}
            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ── Moderation Modal ──────────────────────────────────────────────────────────
function ModerationModal({
  taskIndex,
  onClose,
  onComplete,
}: {
  taskIndex: number;
  onClose: () => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adError, setAdError] = useState('');
  const { playSound } = useSoundEffects();
  const imageSeeds = useRef([
    Math.floor(Math.random() * 900) + 100,
    Math.floor(Math.random() * 900) + 1100,
    Math.floor(Math.random() * 900) + 2100,
  ]);

  const handleAnswer = (ans: string) => {
    playSound('click');
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setAdError('');
    try {
      if (taskIndex < 3) {
        await adHandler('pop');
      } else {
        await adHandler();
      }
      onComplete();
    } catch (error) {
      playSound('error');
      setAdError(error instanceof Error ? error.message : 'Ad is not available. Please try again.');
      setIsProcessing(false);
    }
  };

  const progressPct = ((step + (answers.length > step ? 1 : 0)) / 3) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-3">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium">
            {t('earn.moderateImage')}
          </p>
          <p className="text-white font-bold text-base mt-0.5">
            {t('earn.imageOf', { current: step + 1, total: 3 })}
          </p>
        </div>
        <ButtonTap
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
        >
          <X size={18} className="text-white/70" />
        </ButtonTap>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mb-4 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-amber-400 rounded-full"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>

      <div className="flex-1 px-5 flex flex-col gap-4 overflow-hidden">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-[#1A1A1A] flex-1 max-h-[52vh]">
          <img
            src={`https://picsum.photos/seed/${imageSeeds.current[Math.min(step, 2)]}/400/600`}
            alt="moderation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1">
            <span className="text-white/70 text-xs font-mono font-bold">
              {step + 1} / 3
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {answers.length <= step && step <= 2 && (
          <div className="grid grid-cols-2 gap-3 pb-4">
            <ButtonTap
              onClick={() => handleAnswer('violent')}
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-semibold text-sm"
            >
              ⚠️ {t('earn.violentAdult')}
            </ButtonTap>
            <ButtonTap
              onClick={() => handleAnswer('clear')}
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 font-semibold text-sm"
            >
              ✓ {t('earn.clearHD')}
            </ButtonTap>
          </div>
        )}

        {step === 2 && answers.length === 3 && (
          <div className="pb-4">
            <ButtonTap
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                >
                  {t('earn.submitting')}
                </motion.span>
              ) : (
                <>
                  {t('earn.submit')}
                  <ArrowRight size={18} weight="bold" />
                </>
              )}
            </ButtonTap>
            {adError && (
              <p className="mt-2 text-center text-xs font-medium text-red-400">
                {adError}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Unified Claim Modal ───────────────────────────────────────────────────────
// Single modal for all 7 claim slots. Opens to first unclaimed slot.
// After each success, auto-advances to next unclaimed slot.
function UnifiedClaimModal({
  startSlot,
  onClose,
  onComplete,
}: {
  startSlot: number;
  onClose: () => void;
  onComplete: (claimNumber: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { playSound } = useSoundEffects();

  const [currentSlot, setCurrentSlot] = useState(startSlot);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);

  // Find next unclaimed slot after current
  const claimedKeys = user.claim_codes_used;
  const findNextSlot = (from: number) => {
    for (let n = from + 1; n <= 7; n++) {
      if (!claimedKeys.includes(`v${n}`)) return n;
    }
    return null;
  };

  const claimedCount = claimedKeys.length;
  const isSlotDone = claimedKeys.includes(`v${currentSlot}`);

  const validateCode = (c: string): string | null => {
    const rawParts = c.trim().split('-');
    if (rawParts.length !== 3) return t('earn.invalidCode');
    const [prefix, date, version] = rawParts;
    const prefixUpper = prefix.toUpperCase();
    const allowedUpper = ALLOWED_CLAIM_PREFIXES.map((p) => p.toUpperCase());
    if (!allowedUpper.includes(prefixUpper)) return t('earn.invalidCode');
    if (date !== formatDateForCode()) return t('earn.invalidCode');
    const vMatch = version.match(/^[vV](\d+)$/);
    if (!vMatch) return t('earn.invalidCode');
    const vNum = parseInt(vMatch[1]);
    if (vNum < 1 || vNum > 7) return t('earn.invalidCode');
    if (vNum !== currentSlot) return t('earn.invalidCode');
    const vKey = `v${vNum}`;
    if (user.claim_codes_used.includes(vKey)) return t('earn.alreadyClaimed');
    return null;
  };

  const completeClaim = async () => {
    await onComplete(currentSlot);
    setJustClaimed(true);
    playSound('success');
    setCode('');
    setIsProcessing(false);
    setTimeout(() => {
      const next = findNextSlot(currentSlot);
      if (next) {
        setCurrentSlot(next);
        setJustClaimed(false);
      } else {
        onClose();
      }
    }, 1400);
  };

  const handleBeforeAd = () => {
    const err = validateCode(code);
    if (err) {
      playSound('error');
      setError(err);
      return false;
    }
    setError('');
    setIsProcessing(true);
    return true;
  };

  const handleAdError = (err: unknown) => {
    playSound('error');
    setIsProcessing(false);
    setError(err instanceof Error ? err.message : 'Ad is not available. Please try again.');
  };

  const nextSlot = findNextSlot(currentSlot);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-end">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full bg-[#1C1C1E] rounded-t-3xl border-t border-white/10 flex flex-col"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pb-8 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col gap-0.5">
              <p className="text-white/40 text-xs uppercase tracking-widest font-medium">
                {t('earn.censorClaim')}
              </p>
              <p className="text-white font-bold text-lg">
                {t('earn.claim')} #{currentSlot}
              </p>
            </div>
            <ButtonTap
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
            >
              <X size={18} className="text-white/70" />
            </ButtonTap>
          </div>

          {/* Progress row */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs font-medium">Today's progress</span>
              <span className="text-purple-400 text-xs font-bold tabular-nums">
                {claimedCount}/7 claimed
              </span>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-400 rounded-full"
                animate={{ width: `${(claimedCount / 7) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {/* Slot dots */}
            <div className="flex items-center justify-between mt-1 px-0.5">
              {Array.from({ length: 7 }, (_, i) => {
                const slot = i + 1;
                const done = claimedKeys.includes(`v${slot}`);
                const active = slot === currentSlot;
                return (
                  <div
                    key={slot}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      done
                        ? 'bg-purple-500/30 border-purple-400/50 text-purple-300'
                        : active
                          ? 'bg-amber-400/20 border-amber-400/60 text-amber-300'
                          : 'bg-white/5 border-white/10 text-white/25'
                    }`}
                  >
                    {done ? '✓' : slot}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success flash */}
          <AnimatePresence mode="wait">
            {justClaimed ? (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex flex-col items-center gap-3 py-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
                  <CheckCircle size={36} weight="fill" className="text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-base">
                    +3,000 coins earned!
                  </p>
                  {nextSlot ? (
                    <p className="text-white/40 text-xs mt-1">
                      Loading Claim #{nextSlot}…
                    </p>
                  ) : (
                    <p className="text-white/40 text-xs mt-1">All claims done for today!</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {/* Reward display */}
                <div className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-4 py-3 border border-white/8">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={MEDAL_IMG}
                      alt="medal"
                      className="w-8 h-8 object-contain drop-shadow select-none"
                      draggable={false}
                    />
                    <span className="text-white/50 text-sm">{t('earn.reward')}</span>
                  </div>
                  <span className="text-amber-400 font-black text-base">3,000 coins</span>
                </div>

                {/* Code format hint */}
                <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl px-4 py-3">
                  <p className="text-amber-400/80 text-xs font-medium leading-relaxed">
                    {t('earn.codeFormat')}
                  </p>
                </div>

                {/* Code input */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                    {t('earn.enterCode')}
                  </label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                    }}
                    placeholder={`S9t-${formatDateForCode()}-v${currentSlot}`}
                    className="h-12 w-full bg-[#0D0D0D] border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-mono focus-visible:ring-amber-400/40 placeholder:text-white/20 transition-colors"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-xs font-medium"
                      >
                        ⚠ {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit button */}
                <AdComponent
                  onBeforeShow={handleBeforeAd}
                  onReward={completeClaim}
                  onError={handleAdError}
                  disabled={isProcessing || !code.trim() || isSlotDone}
                  className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                    >
                      {t('earn.submitting')}
                    </motion.span>
                  ) : (
                    <>
                      {t('earn.watchAd')}
                      <Lightning size={18} weight="fill" />
                    </>
                  )}
                </AdComponent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── EarnPage ──────────────────────────────────────────────────────────────────
type ActiveModal =
  | { type: 'moderation'; taskIndex: number }
  | { type: 'claim'; startSlot: number }
  | null;

export default function EarnPage() {
  const { t } = useTranslation();
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const { playSound } = useSoundEffects();

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [reward, setReward] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });
  const [ytTimer, setYtTimer] = useState<number | null>(null);
  const [ttTimer, setTtTimer] = useState<number | null>(null);
  const [rewardLottie, setRewardLottie] = useState<object | null>(null);

  // Pre-load reward Lottie animation
  useEffect(() => {
    fetch(REWARD_LOTTIE_URL)
      .then((r) => r.json())
      .then(setRewardLottie)
      .catch(() => {});
  }, []);

  const openModal = (modal: ActiveModal) => {
    playSound('modal');
    setActiveModal(modal);
  };

  // ── Task complete ────────────────────────────────────────────────────────
  const handleTaskComplete = async (taskIndex: number) => {
    setActiveModal(null);
    await updateUser({
      total_points: user.total_points + 5000,
      today_tasks_completed: user.today_tasks_completed + 1,
    });
    playSound('coin');
    setReward({ amount: 5000, show: true });
  };

  // ── Claim complete ───────────────────────────────────────────────────────
  const handleClaimComplete = async (claimNumber: number) => {
    const vKey = `v${claimNumber}`;
    const newClaims = [...user.claim_codes_used, vKey];
    await updateUser({
      total_points: user.total_points + 3000,
      claim_codes_used: newClaims,
    });
    playSound('coin');
    setReward({ amount: 3000, show: true });
  };

  // ── Social tasks ─────────────────────────────────────────────────────────
  const handleSocialTask = (type: 'youtube' | 'tiktok') => {
    if (type === 'youtube') {
      if (user.youtube_task_completed) return;
      window.open('https://youtube.com/@censorcoin', '_blank');
      setYtTimer(120);
    } else {
      if (user.tiktok_task_completed) return;
      window.open('https://tiktok.com/@censorcoin', '_blank');
      setTtTimer(120);
    }
  };

  useEffect(() => {
    if (ytTimer === null) return;
    if (ytTimer === 0) {
      updateUser({ total_points: user.total_points + 10000, youtube_task_completed: true });
      playSound('coin');
      setReward({ amount: 10000, show: true });
      setYtTimer(null);
      toast({ title: t('earn.taskComplete') });
      return;
    }
    const timer = setTimeout(() => setYtTimer((prev) => (prev ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [ytTimer]);

  useEffect(() => {
    if (ttTimer === null) return;
    if (ttTimer === 0) {
      updateUser({ total_points: user.total_points + 10000, tiktok_task_completed: true });
      playSound('coin');
      setReward({ amount: 10000, show: true });
      setTtTimer(null);
      toast({ title: t('earn.taskComplete') });
      return;
    }
    const timer = setTimeout(() => setTtTimer((prev) => (prev ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [ttTimer]);

  // Find first unclaimed slot for the unified modal
  const firstUnclaimedSlot =
    Array.from({ length: 7 }, (_, i) => i + 1).find(
      (n) => !user.claim_codes_used.includes(`v${n}`),
    ) ?? 1;

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-10">

      {/* ── Overlays ── */}
      <AnimatePresence>
        {reward.show && (
          <CoinRewardOverlay
            amount={reward.amount}
            lottieData={rewardLottie}
            onDone={() => setReward({ amount: 0, show: false })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal?.type === 'moderation' && (
          <ModerationModal
            taskIndex={activeModal.taskIndex}
            onClose={() => setActiveModal(null)}
            onComplete={() => handleTaskComplete(activeModal.taskIndex)}
          />
        )}
        {activeModal?.type === 'claim' && (
          <UnifiedClaimModal
            startSlot={activeModal.startSlot}
            onClose={() => setActiveModal(null)}
            onComplete={handleClaimComplete}
          />
        )}
      </AnimatePresence>

      {/* ── Daily Censoring Section ── */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={TASK_IMG}
            alt="tasks"
            className="w-9 h-9 object-contain drop-shadow select-none"
            draggable={false}
          />
          <div className="flex-1">
            <h2 className="text-white font-black text-xl leading-tight">{t('earn.dailyCensoring')}</h2>
            <p className="text-white/40 text-xs mt-0.5">{t('earn.dailyCensoringDesc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-400 rounded-full"
              animate={{ width: `${(user.today_tasks_completed / 6) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-amber-400 text-xs font-bold tabular-nums shrink-0">
            {user.today_tasks_completed}/6
          </span>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => {
          const isDone = i < user.today_tasks_completed;
          const isNext = i === user.today_tasks_completed;
          const isLocked = i > user.today_tasks_completed;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                isDone
                  ? 'bg-green-500/5 border-green-500/20'
                  : isNext
                    ? 'bg-[#1A1A1A] border-amber-400/35 shadow-[0_0_20px_rgba(251,191,36,0.06)]'
                    : 'bg-[#1A1A1A] border-white/6 opacity-70'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${
                  isDone ? 'bg-green-500/15' : isNext ? 'bg-amber-400/10' : 'bg-white/5'
                }`}
              >
                {isDone ? (
                  <CheckCircle size={22} weight="fill" className="text-green-400" />
                ) : isNext ? (
                  <img
                    src={TASK_IMG}
                    alt=""
                    className="w-8 h-8 object-contain select-none"
                    draggable={false}
                  />
                ) : (
                  <span className="text-white/25 font-bold text-sm">{i + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${isDone ? 'text-white/40' : 'text-white'}`}>
                  {t('earn.task')} #{i + 1}
                </p>
                <p className={`text-xs mt-0.5 font-medium ${isDone ? 'text-white/20' : 'text-amber-400/80'}`}>
                  5,000 {t('common.coins')}
                </p>
              </div>

              {isDone ? (
                <div className="flex items-center gap-1.5 bg-green-500/15 px-3 py-1.5 rounded-lg shrink-0">
                  <CheckCircle size={13} weight="fill" className="text-green-400" />
                  <span className="text-green-400 text-xs font-semibold">{t('earn.done')}</span>
                </div>
              ) : isLocked ? (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg shrink-0">
                  <Lock size={13} weight="thin" className="text-white/25" />
                  <span className="text-white/25 text-xs font-semibold">Locked</span>
                </div>
              ) : (
                <ButtonTap
                  onClick={() => openModal({ type: 'moderation', taskIndex: i })}
                  className="flex items-center gap-1.5 bg-amber-400/15 px-3 py-1.5 rounded-lg border border-amber-400/30 shrink-0"
                >
                  <Eye size={13} weight="thin" className="text-amber-400" />
                  <span className="text-amber-400 text-xs font-semibold">{t('earn.start')}</span>
                </ButtonTap>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Censor Claim Section ── */}
      <div className="px-5 pt-9 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={MEDAL_IMG}
            alt="claim"
            className="w-9 h-9 object-contain drop-shadow select-none"
            draggable={false}
          />
          <div className="flex-1">
            <h2 className="text-white font-black text-xl leading-tight">{t('earn.censorClaim')}</h2>
            <p className="text-white/40 text-xs mt-0.5">{t('earn.censorClaimDesc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-400 rounded-full"
              animate={{ width: `${(user.claim_codes_used.length / 7) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-purple-400 text-xs font-bold tabular-nums shrink-0">
            {user.claim_codes_used.length}/7
          </span>
        </div>
      </div>

      {/* Claim cards grid — 2 columns for compactness */}
      <div className="px-5 grid grid-cols-2 gap-2.5">
        {Array.from({ length: 7 }).map((_, i) => {
          const vKey = `v${i + 1}`;
          const isDone = user.claim_codes_used.includes(vKey);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`rounded-2xl border p-4 flex flex-col gap-2.5 ${
                isDone
                  ? 'bg-purple-500/5 border-purple-500/20'
                  : 'bg-[#1A1A1A] border-white/6'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden ${
                  isDone ? 'bg-purple-500/15' : 'bg-purple-400/10'
                }`}>
                  {isDone ? (
                    <CheckCircle size={20} weight="fill" className="text-purple-400" />
                  ) : (
                    <Ticket size={18} weight="thin" className="text-purple-400" />
                  )}
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${
                  isDone ? 'text-purple-400/60' : 'text-white/30'
                }`}>
                  v{i + 1}
                </span>
              </div>

              <div>
                <p className={`font-semibold text-sm leading-tight ${isDone ? 'text-white/40' : 'text-white'}`}>
                  {t('earn.claim')} #{i + 1}
                </p>
                <p className={`text-xs mt-0.5 font-medium ${isDone ? 'text-white/20' : 'text-purple-400/80'}`}>
                  3,000 {t('common.coins')}
                </p>
              </div>

              {isDone ? (
                <div className="flex items-center gap-1 bg-purple-500/15 px-2 py-1.5 rounded-lg justify-center">
                  <CheckCircle size={12} weight="fill" className="text-purple-400" />
                  <span className="text-purple-400 text-[10px] font-semibold">{t('earn.done')}</span>
                </div>
              ) : (
                <ButtonTap
                  onClick={() => openModal({ type: 'claim', startSlot: firstUnclaimedSlot })}
                  className="flex items-center gap-1 bg-purple-400/15 px-2 py-1.5 rounded-lg border border-purple-400/30 justify-center"
                >
                  <Medal size={12} weight="thin" className="text-purple-400" />
                  <span className="text-purple-400 text-[10px] font-semibold">{t('earn.enterCode')}</span>
                </ButtonTap>
              )}
            </motion.div>
          );
        })}

        {/* Spacer for odd item in 2-col grid */}
        <div />
      </div>

      {/* ── Social Tasks Section ── */}
      <div className="px-5 pt-9 pb-4">
        <h2 className="text-white font-black text-xl">{t('earn.socialTasks')}</h2>
        <p className="text-white/40 text-xs mt-1">{t('earn.socialTasksDesc')}</p>
      </div>

      <div className="px-5 flex flex-col gap-2.5">
        {/* YouTube */}
        <motion.div
          className={`rounded-2xl border p-4 flex items-center gap-4 ${
            user.youtube_task_completed
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-[#1A1A1A] border-white/6'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center overflow-hidden shrink-0">
            {user.youtube_task_completed ? (
              <CheckCircle size={24} weight="fill" className="text-green-400" />
            ) : (
              <img
                src={YOUTUBE_IMG}
                alt="YouTube"
                className="w-9 h-9 object-contain select-none"
                draggable={false}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${user.youtube_task_completed ? 'text-white/40' : 'text-white'}`}>
              {t('earn.youtubeTask')}
            </p>
            <p className={`text-xs mt-0.5 ${user.youtube_task_completed ? 'text-white/20' : 'text-white/40'}`}>
              {user.youtube_task_completed ? 'Completed' : t('earn.oneTimeBonus')}
            </p>
            <p className={`text-xs font-bold mt-0.5 ${user.youtube_task_completed ? 'text-white/20' : 'text-red-400'}`}>
              10,000 coins
            </p>
          </div>
          {user.youtube_task_completed ? (
            <div className="flex items-center gap-1.5 bg-green-500/15 px-3 py-1.5 rounded-lg shrink-0">
              <CheckCircle size={13} weight="fill" className="text-green-400" />
              <span className="text-green-400 text-xs font-semibold">{t('earn.done')}</span>
            </div>
          ) : ytTimer !== null ? (
            <div className="bg-white/10 px-3 py-1.5 rounded-lg min-w-[64px] text-center shrink-0">
              <span className="text-amber-400 text-xs font-mono font-bold tabular-nums">
                {Math.floor(ytTimer / 60)}:{String(ytTimer % 60).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <ButtonTap
              onClick={() => handleSocialTask('youtube')}
              className="flex items-center gap-1.5 bg-red-500/15 px-3 py-1.5 rounded-lg border border-red-500/30 shrink-0"
            >
              <Star size={13} weight="thin" className="text-red-400" />
              <span className="text-red-400 text-xs font-semibold">{t('earn.openLink')}</span>
            </ButtonTap>
          )}
        </motion.div>

        {/* TikTok */}
        <motion.div
          className={`rounded-2xl border p-4 flex items-center gap-4 ${
            user.tiktok_task_completed
              ? 'bg-pink-500/5 border-pink-500/20'
              : 'bg-[#1A1A1A] border-white/6'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-12 h-12 rounded-xl bg-pink-500/15 flex items-center justify-center overflow-hidden shrink-0">
            {user.tiktok_task_completed ? (
              <CheckCircle size={24} weight="fill" className="text-green-400" />
            ) : (
              <img
                src={TIKTOK_IMG}
                alt="TikTok"
                className="w-9 h-9 object-contain select-none"
                draggable={false}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${user.tiktok_task_completed ? 'text-white/40' : 'text-white'}`}>
              {t('earn.tiktokTask')}
            </p>
            <p className={`text-xs mt-0.5 ${user.tiktok_task_completed ? 'text-white/20' : 'text-white/40'}`}>
              {user.tiktok_task_completed ? 'Completed' : t('earn.oneTimeBonus')}
            </p>
            <p className={`text-xs font-bold mt-0.5 ${user.tiktok_task_completed ? 'text-white/20' : 'text-pink-400'}`}>
              10,000 coins
            </p>
          </div>
          {user.tiktok_task_completed ? (
            <div className="flex items-center gap-1.5 bg-green-500/15 px-3 py-1.5 rounded-lg shrink-0">
              <CheckCircle size={13} weight="fill" className="text-green-400" />
              <span className="text-green-400 text-xs font-semibold">{t('earn.done')}</span>
            </div>
          ) : ttTimer !== null ? (
            <div className="bg-white/10 px-3 py-1.5 rounded-lg min-w-[64px] text-center shrink-0">
              <span className="text-amber-400 text-xs font-mono font-bold tabular-nums">
                {Math.floor(ttTimer / 60)}:{String(ttTimer % 60).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <ButtonTap
              onClick={() => handleSocialTask('tiktok')}
              className="flex items-center gap-1.5 bg-pink-500/15 px-3 py-1.5 rounded-lg border border-pink-500/30 shrink-0"
            >
              <Star size={13} weight="thin" className="text-pink-400" />
              <span className="text-pink-400 text-xs font-semibold">{t('earn.openLink')}</span>
            </ButtonTap>
          )}
        </motion.div>
      </div>
    </div>
  );
}
