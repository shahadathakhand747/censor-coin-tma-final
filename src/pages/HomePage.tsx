import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { Users, ListChecks, Certificate, Coins } from '@phosphor-icons/react';
import { useUser } from '../context/UserContext';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

// Icons8 3D Fluency Bitcoin coin — free CDN, transparent background
const COIN_IMG = 'https://img.icons8.com/3d-fluency/256/bitcoin.png';

// Looping crypto coin Lottie from LottieFiles CDN
const LOTTIE_COIN_URL = 'https://assets9.lottiefiles.com/packages/lf20_syqnfe7c.json';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [lottieData, setLottieData] = useState<object | null>(null);

  useEffect(() => {
    fetch(LOTTIE_COIN_URL)
      .then((r) => r.json())
      .then(setLottieData)
      .catch(() => {});
  }, []);

  const stats = [
    {
      label: t('home.totalRefers'),
      value: user.total_refers.toString(),
      Icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/15',
    },
    {
      label: t('home.tasksToday'),
      value: `${user.today_tasks_completed}/6`,
      Icon: ListChecks,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/15',
      progress: (user.today_tasks_completed / 6) * 100,
      progressColor: 'bg-green-400',
    },
    {
      label: t('home.claimsToday'),
      value: `${user.claim_codes_used.length}/7`,
      Icon: Certificate,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/15',
      progress: (user.claim_codes_used.length / 7) * 100,
      progressColor: 'bg-purple-400',
    },
    {
      label: t('home.totalPoints'),
      value: formatNumber(user.total_points),
      Icon: Coins,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/15',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs font-medium tracking-widest uppercase">
              {t('home.totalPoints')}
            </p>
            <motion.h1
              key={user.total_points}
              initial={{ scale: 1.1, color: '#FBBF24' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-black text-white mt-0.5 tracking-tight"
            >
              {user.total_points.toLocaleString()}
            </motion.h1>
            <p className="text-amber-400/60 text-xs font-medium mt-0.5">coins</p>
          </div>

          <div className="flex flex-col items-center gap-1 shrink-0">
            {user.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt="avatar"
                className="w-14 h-14 rounded-2xl border-2 border-amber-400/30 object-cover shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-xl shadow-lg">
                {(user.first_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            {user.username && (
              <p className="text-white/30 text-[10px] font-medium">@{user.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Coin Hero ── */}
      <div className="flex flex-col items-center py-4 relative">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Glow aura */}
          <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-3xl scale-[1.6]" />
          {/* Ring */}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-300/20 to-amber-500/10 border-2 border-amber-400/35 flex items-center justify-center shadow-2xl shadow-amber-400/30 p-2">
            {lottieData ? (
              <div className="w-24 h-24">
                <Lottie animationData={lottieData} loop autoplay />
              </div>
            ) : (
              <motion.img
                src={COIN_IMG}
                alt="Censor Coin"
                className="w-24 h-24 object-contain drop-shadow-xl select-none"
                animate={{ rotateY: [0, 10, 0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                draggable={false}
              />
            )}
          </div>
        </motion.div>

        <motion.p
          className="mt-3 text-white/30 text-xs font-semibold tracking-[0.3em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Censor Coin
        </motion.p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="px-5 py-3 grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon, color, bg, border, progress, progressColor }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`bg-[#1A1A1A] rounded-2xl border ${border} p-4 flex flex-col gap-2`}
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={20} weight="thin" className={color} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider leading-none">
                {label}
              </p>
              <p className="text-white text-xl font-bold mt-1 leading-none">{value}</p>
            </div>
            {typeof progress === 'number' && (
              <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${progressColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08 + 0.3 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Welcome Card ── */}
      <div className="px-5 pb-5 pt-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-r from-amber-400/10 to-amber-600/5 rounded-2xl border border-amber-400/20 p-4 flex items-center gap-3"
        >
          <span className="text-2xl select-none">👋</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user.first_name ? `Hey, ${user.first_name}!` : 'Welcome to Censor Coin!'}
            </p>
            <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
              Complete tasks daily to earn more coins.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
