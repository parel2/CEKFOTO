import { useEffect, useState } from 'react';

// Fraction 0..1 of a stage that has elapsed, derived from wall-clock time so
// throttled background tabs catch up instead of drifting.
export function useElapsed(durationMs: number, active = true): number {
  const [fraction, setFraction] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const tick = () => {
      const f = Math.min(1, (Date.now() - start) / durationMs);
      setFraction(f);
      return f >= 1;
    };
    if (tick()) return;
    const id = window.setInterval(() => {
      if (tick()) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [durationMs, active]);
  return fraction;
}
