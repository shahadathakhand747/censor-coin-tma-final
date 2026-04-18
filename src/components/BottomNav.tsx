import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { House, Coins, UserCircle } from '@phosphor-icons/react';
import ButtonTap from './ButtonTap';
import { useSoundEffects } from '../hooks/useSoundEffects';

const tabs = [
  { label: 'nav.home', path: '/home', Icon: House },
  { label: 'nav.earn', path: '/earn', Icon: Coins },
  { label: 'nav.profile', path: '/profile', Icon: UserCircle },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();

  const handleTabPress = (path: string) => {
    if (location.pathname !== path) {
      playSound('modal');
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50">
      <div className="bg-[#111111]/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-2 py-2 safe-bottom">
        {tabs.map(({ label, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <ButtonTap
              key={path}
              onClick={() => handleTabPress(path)}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all relative"
            >
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-amber-400" />
              )}
              <Icon
                size={24}
                weight={isActive ? 'fill' : 'thin'}
                className={isActive ? 'text-amber-400' : 'text-white/40'}
              />
              <span
                className={`text-[10px] font-medium tracking-wide ${
                  isActive ? 'text-amber-400' : 'text-white/40'
                }`}
              >
                {t(label)}
              </span>
            </ButtonTap>
          );
        })}
      </div>
    </nav>
  );
}
