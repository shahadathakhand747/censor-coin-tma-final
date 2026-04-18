import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
      data-sound-handled="true"
      className={cn(buttonVariants({ variant: 'ghost' }), 'h-auto min-h-0 rounded-xl p-0 hover:bg-transparent active:bg-transparent', className)}
    >
      {children}
    </motion.button>
  );
}
