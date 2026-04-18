import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

// Icons8 3D Fluency Bitcoin — free CDN, transparent background
const COIN_IMG = 'https://img.icons8.com/3d-fluency/256/bitcoin.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      if (user.membership_verified) {
        navigate('/home');
      } else {
        navigate('/verify');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isLoaded, user.membership_verified, navigate]);

  return (
    <div className="fixed inset-0 bg-[#0D0D0D] flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-7"
      >
        {/* 3D Coin with glow ring */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-3xl scale-150" />
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-300/30 to-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center shadow-2xl shadow-amber-500/40 p-2">
            <motion.img
              src={COIN_IMG}
              alt="Censor Coin"
              className="w-full h-full object-contain drop-shadow-2xl select-none"
              animate={{ rotateY: [0, 8, 0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              draggable={false}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black tracking-tighter text-white leading-none">
            censor coin
          </h1>
          <p className="mt-2.5 text-amber-400/70 text-[11px] font-semibold tracking-[0.35em] uppercase">
            Earn · Censor · Grow
          </p>
        </motion.div>

        {/* Animated loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400"
              animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.3, delay: i * 0.22 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
