import { useEffect, useRef, useState } from 'react';
import ButtonTap from './ButtonTap';

type AdComponentProps = {
  onReward?: () => void | Promise<void>;
  onError?: (error: unknown) => void;
  onBeforeShow?: () => boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function AdComponent({
  onReward,
  onError,
  onBeforeShow,
  disabled,
  className,
  children,
}: AdComponentProps) {
  const [id] = useState(6116695);
  const showAd = useRef<(() => Promise<void>) | undefined>();

  useEffect(() => {
    // @ts-expect-error admanager
    window.initCdTma?.({ id }).then(show => showAd.current = show).catch(e => console.log(e));
  }, [id]);

  return (
    <ButtonTap
      disabled={disabled}
      className={className}
      onClick={() => {
        if (onBeforeShow && !onBeforeShow()) return;
        if (!showAd.current) {
          onError?.(new Error('OnClickA ad is not ready'));
          return;
        }
        showAd.current?.().then(() => onReward?.()).catch((err) => onError?.(err));
      }}
    >
      {children || 'Claim Reward'}
    </ButtonTap>
  );
}
