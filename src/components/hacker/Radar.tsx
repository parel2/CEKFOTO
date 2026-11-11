import type { CSSProperties } from 'react';

interface RadarProps {
  progress: number;
  showTarget: boolean;
}

export function Radar({ progress, showTarget }: RadarProps) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div className="radar" aria-hidden="true" style={{ '--converge': 1 - p * 0.55 } as CSSProperties}>
      <div className="radar-rings">
        <span />
        <span />
        <span />
      </div>
      <div className="radar-sweep" />
      <span className={`radar-target ${showTarget ? 'is-on' : ''}`} />
    </div>
  );
}
