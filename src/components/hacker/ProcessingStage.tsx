import { useElapsed } from '@/hooks/useElapsed';
import { useUnevenProgress } from '@/hooks/useUnevenProgress';
import { useScramble } from '@/hooks/useScramble';
import { DecryptGauge } from '@/components/hacker/DecryptGauge';
import { HexDump } from '@/components/hacker/HexDump';
import { Radar } from '@/components/hacker/Radar';
import { SideGraphs } from '@/components/hacker/SideGraphs';
import { HudPanel } from '@/components/hacker/HudPanel';

interface ProcessingStageProps {
  durationMs: number;
}

const LAYER_COUNT = 5;
const TRIANGULATE_WORDS = [
  'TRIANGULATING...',
  'SCANNING GPS IFD...',
  'SATELLITE HANDSHAKE...',
  'MEASURING DELTA...',
  'TRIANGULATING...',
  'LOCK PENDING...',
];

const PHASES = [
  'PHASE 2A · BREACHING',
  'PHASE 2B · HEADER ANALYSIS',
  'PHASE 2C · DECRYPTING',
  'PHASE 2D · LOCATING GPS IFD',
];

function BreachView({ layersDone }: { layersDone: number }) {
  return (
    <div className="breach">
      {Array.from({ length: LAYER_COUNT }, (_, i) => (
        <div key={i} className={`breach-layer ${i < layersDone ? 'is-done' : ''}`}>
          <span className="breach-fill" />
          <span className="breach-label">LAYER {i + 1}/{LAYER_COUNT}</span>
        </div>
      ))}
    </div>
  );
}

function TriangulateWord({ phaseFraction }: { phaseFraction: number }) {
  const index = Math.min(TRIANGULATE_WORDS.length - 1, Math.floor(phaseFraction * TRIANGULATE_WORDS.length));
  const word = useScramble(TRIANGULATE_WORDS[index], true, 500);
  return <p className="tri-word">{word}</p>;
}

export function ProcessingStage({ durationMs }: ProcessingStageProps) {
  const fraction = useElapsed(durationMs);
  const progress = useUnevenProgress(durationMs, true);

  const phaseIndex = Math.min(PHASES.length - 1, Math.floor(fraction * PHASES.length));
  const phaseFraction = Math.min(1, fraction * PHASES.length - phaseIndex);
  const layersDone = Math.min(LAYER_COUNT, Math.floor((fraction * LAYER_COUNT) / 0.8));
  const pct = Math.round(progress);

  return (
    <HudPanel title="PROCESSING CORE" status={`${pct}%`} tone="green" className="stage-panel" bodyClassName="stage-body">
      <div className="proc-body">
        <div className="proc-main">
          <p className="proc-phase">{PHASES[phaseIndex]}</p>
          <div className="proc-view">
            {phaseIndex === 0 && <BreachView layersDone={layersDone} />}
            {phaseIndex === 1 && <HexDump />}
            {phaseIndex === 2 && <DecryptGauge value={progress} />}
            {phaseIndex === 3 && (
              <div className="locate">
                <Radar progress={phaseFraction} showTarget={phaseFraction > 0.6} />
                <TriangulateWord phaseFraction={phaseFraction} />
              </div>
            )}
          </div>
          <p className="proc-layers">LAYER {Math.min(layersDone, LAYER_COUNT)}/{LAYER_COUNT} BYPASSED</p>
        </div>
        <SideGraphs />
      </div>
      <div className="proc-progress">
        <span className="proc-progress-label">TOTAL</span>
        <div className="proc-bar" aria-hidden="true">
          <span className="proc-bar-fill" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <span className="proc-progress-value">{pct}%</span>
      </div>
    </HudPanel>
  );
}
