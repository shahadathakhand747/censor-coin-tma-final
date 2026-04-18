import { useEffect } from 'react';

const SOUND_URL = `${import.meta.env.BASE_URL}scifi-click.mp3`;

export function useGlobalClickSound() {
  useEffect(() => {
    const play = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const interactive = target.closest('button,a,input,select,textarea,[role="button"],[role="tab"],[data-click-sound]');
      if (!(interactive instanceof HTMLElement)) return;
      if (interactive.dataset.soundHandled === 'true') return;

      const audio = new Audio(SOUND_URL);
      audio.volume = 0.45;
      audio.play().catch(() => {});
    };

    document.addEventListener('pointerup', play, true);
    return () => document.removeEventListener('pointerup', play, true);
  }, []);
}
