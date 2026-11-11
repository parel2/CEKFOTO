import { useEffect, useState } from 'react';
import { useElapsed } from '@/hooks/useElapsed';
import { useScramble } from '@/hooks/useScramble';
import { HudPanel } from '@/components/hacker/HudPanel';
import { Radar } from '@/components/hacker/Radar';
import { CopyCoordsButton } from '@/components/hacker/CopyCoordsButton';
import { decimalCoord, dmsCoord } from '@/lib/metadata';
import type { PhotoAnalysis, Stage } from '@/types/photo';

interface GpsPanelProps {
  stage: Stage;
  analysis: PhotoAnalysis | null;
  durationMs: number;
  onOpenMap: () => void;
}

function GpsSearching({ fraction, hasGPS }: { fraction: number; hasGPS: boolean }) {
  const label = fraction < 0.35
    ? 'SEARCHING SATELLITES...'
    : fraction < 0.6 ? 'TARGET LOCATION ACQUIRED' : fraction < 0.85 ? 'DECODING COORDINATES...' : 'LOCKING TARGET...';
  return (
    <>
      <Radar progress={fraction} showTarget={hasGPS && fraction > 0.5} />
      <p className="gps-label">{label}</p>
    </>
  );
}

export function GpsPanel({ stage, analysis, durationMs, onOpenMap }: GpsPanelProps) {
  const fraction = useElapsed(durationMs, stage === 'gps');
  const hasGPS = analysis?.hasGPS ?? false;
  const coordText = hasGPS && analysis ? decimalCoord(analysis.lat, analysis.lng) : '';
  const decoded = useScramble(coordText, stage === 'gps' && fraction > 0.6 && hasGPS, 900);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (stage !== 'flash') return;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 700);
    return () => window.clearTimeout(id);
  }, [stage]);

  const isResult = stage === 'result';
  const isGpsStage = stage === 'gps' || stage === 'flash';
  const status = isResult || isGpsStage
    ? (hasGPS ? 'LOCK' : 'NO SIGNAL')
    : 'STANDBY';

  let body;
  if (stage === 'idle') {
    body = <p className="gps-idle">Menunggu foto. Lokasi akan dibaca dari data GPS foto.</p>;
  } else if (isGpsStage) {
    body = (
      <div className="gps-search">
        <GpsSearching fraction={fraction} hasGPS={hasGPS} />
        {hasGPS && fraction > 0.6 && <p className="gps-coord">{decoded}</p>}
        {!hasGPS && fraction > 0.85 && <p className="gps-missing">GPS DATA NOT FOUND IN IMAGE</p>}
        {hasGPS && fraction > 0.85 && <p className="gps-complete">TRIANGULATION COMPLETE</p>}
      </div>
    );
  } else if (isResult && analysis) {
    body = hasGPS ? (
      <div className="gps-result">
        <p className="gps-coord">{coordText}</p>
        <p className="gps-dms">{dmsCoord(analysis.lat, analysis.lng)}{analysis.alt !== null ? ` · alt ${analysis.alt} m` : ''}</p>
        <div className="gps-actions">
          <button type="button" className="btn btn-primary" onClick={onOpenMap}>BUKA POPUP PETA</button>
          <CopyCoordsButton lat={analysis.lat} lng={analysis.lng} />
          <a className="btn" href={`https://www.google.com/maps?q=${analysis.lat},${analysis.lng}`} target="_blank" rel="noopener noreferrer">
            Buka di Google Maps
          </a>
        </div>
      </div>
    ) : (
      <p className="gps-missing">GPS DATA NOT FOUND IN IMAGE</p>
    );
  } else {
    body = <div className="gps-search"><GpsSearching fraction={0} hasGPS={false} /></div>;
  }

  return (
    <HudPanel
      title="TARGET LOCATION"
      status={status}
      tone={hasGPS && (isResult || isGpsStage) ? 'green' : 'cyan'}
      className={`gps-panel ${flash ? 'is-flash' : ''}`}
      bodyClassName="gps-body"
    >
      {body}
    </HudPanel>
  );
}
