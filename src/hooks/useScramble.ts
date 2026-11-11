import { useEffect, useState } from 'react';
import { randomGlyph } from '@/lib/utils';

// Shows random glyphs that gradually lock onto `target`; when disabled, shows `target` directly.
export function useScramble(target: string, enabled: boolean, durationMs = 700): string {
  const [display, setDisplay] = useState(enabled ? '' : target);

  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      return;
    }
    const start = Date.now();
    const render = () => {
      const progress = Math.min(1, (Date.now() - start) / durationMs);
      if (progress >= 1) {
        setDisplay(target);
        return true;
      }
      const locked = Math.floor(target.length * progress);
      setDisplay(
        target.slice(0, locked) +
        Array.from(target.slice(locked), c => (c === ' ' ? ' ' : randomGlyph())).join('')
      );
      return false;
    };
    if (render()) return;
    const id = window.setInterval(() => {
      if (render()) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [target, enabled, durationMs]);

  return display;
}
