import { useState } from 'react';
import { randBetween } from '@/lib/utils';
import type { Stage } from '@/types/photo';

interface ScanOverlayProps {
  stage: Stage;
  fraction: number;
}

const POINT_COUNT = 12;

export function ScanOverlay({ stage, fraction }: ScanOverlayProps) {
  const [points] = useState(() =>
    Array.from({ length: POINT_COUNT }, (_, i) => ({
      x: randBetween(8, 88),
      y: randBetween(8, 86),
      label: String(i + 1).padStart(2, '0'),
    }))
  );

  const processing = stage === 'processing';
  const gridOn = processing || fraction > 0.2;
  const pointsShown = processing
    ? POINT_COUNT
    : Math.floor(Math.min(1, Math.max(0, (fraction - 0.7) / 0.3)) * POINT_COUNT);

  return (
    <div className={`scan-overlay ${processing ? 'is-processing' : ''}`} aria-hidden="true">
      <div className={`scan-grid ${gridOn ? 'is-on' : ''}`} />
      <div className={`scan-cross ${gridOn ? 'is-on' : ''}`}>
        <span className="scan-cross-h" />
        <span className="scan-cross-v" />
      </div>
      <div className="scan-bbox">
        <span className="scan-bbox-label">TGT-01 · {Math.round(fraction * 100)}%</span>
      </div>
      <div className="scan-line" />
      {points.slice(0, pointsShown).map(p => (
        <div key={p.label} className="scan-point" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <span className="scan-point-dot" />
          <span className="scan-point-label">{p.label}</span>
        </div>
      ))}
    </div>
  );
}
