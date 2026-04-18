import useSound from 'use-sound';

export type SoundType = 'click' | 'coin' | 'success' | 'error' | 'modal';

const SOUND_URL = '/scifi-click.mp3';

export function useSoundEffects() {
  const [playClick] = useSound(SOUND_URL, { volume: 0.5 });
  const [playCoin] = useSound(SOUND_URL, { volume: 0.7, playbackRate: 1.2 });
  const [playSuccess] = useSound(SOUND_URL, { volume: 0.5, playbackRate: 0.9 });
  const [playError] = useSound(SOUND_URL, { volume: 0.45, playbackRate: 0.8 });
  const [playModal] = useSound(SOUND_URL, { volume: 0.4, playbackRate: 1.1 });

  const playSound = (type: SoundType) => {
    try {
      if (type === 'click') playClick();
      else if (type === 'coin') playCoin();
      else if (type === 'success') playSuccess();
      else if (type === 'error') playError();
      else if (type === 'modal') playModal();
    } catch {
    }
  };

  return { playSound };
}
