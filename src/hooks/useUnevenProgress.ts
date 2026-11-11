import { useEffect, useState } from 'react';
import { randBetween } from '@/lib/utils';

// Progress that tracks elapsed time with irregular steps and occasional stalls, capped below 100 until the end.
export function useUnevenProgress(durationMs: number, active: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    let current = 0;
    let stalledUntil = 0;
    const id = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - start;
      if (elapsed >= durationMs) {
        window.clearInterval(id);
        setValue(100);
        return;
      }
      const target = Math.min(97, (elapsed / durationMs) * 100);
      if (now >= stalledUntil) {
        if (Math.random() < 0.08) stalledUntil = now + randBetween(700, 1400);
        else current += (target - current) * randBetween(0.25, 0.55) + randBetween(-0.4, 0.6);
      }
      current = Math.max(0, Math.min(97, current));
      setValue(current);
    }, 250);
    return () => window.clearInterval(id);
  }, [durationMs, active]);

  return value;
}
