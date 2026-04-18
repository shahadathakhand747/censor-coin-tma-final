import { motion } from 'framer-motion';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface ButtonTapProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export default function ButtonTap({
  onClick,
  children,
  className = '',
  disabled = false,
  type = 'button',
}: ButtonTapProps) {
  const { playSound } = useSoundEffects();

  const handleClick = () => {
    if (!disabled) {
      playSound('click');
      onClick?.();
    }
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400 }}
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}
