import { useEffect, useState } from 'react';
import { TIMING } from '@/config/timing';

export interface Durations {
  SCAN_MS: number;
  PROCESS_MS: number;
  REVEAL_MS: number;
  GPS_LOCK_MS: number;
  POPUP_DELAY_MS: number;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function getDurations(reduced: boolean): Durations {
  const f = reduced ? TIMING.REDUCED_MOTION_FACTOR : 1;
  return {
    SCAN_MS: TIMING.SCAN_MS * f,
    PROCESS_MS: TIMING.PROCESS_MS * f,
    REVEAL_MS: TIMING.REVEAL_MS * f,
    GPS_LOCK_MS: TIMING.GPS_LOCK_MS * f,
    POPUP_DELAY_MS: TIMING.POPUP_DELAY_MS * f,
  };
}
