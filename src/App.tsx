import { useReducedMotion, getDurations } from '@/hooks/useMotion';
import { useScanPipeline } from '@/hooks/useScanPipeline';
import { MatrixRain } from '@/components/hacker/MatrixRain';
import { HudPanel } from '@/components/hacker/HudPanel';
import { ImagePanel } from '@/components/hacker/ImagePanel';
import { LogTerminal } from '@/components/hacker/LogTerminal';
import { ProcessingStage } from '@/components/hacker/ProcessingStage';
import { DataReveal } from '@/components/hacker/DataReveal';
import { GpsPanel } from '@/components/hacker/GpsPanel';
import { LocationModal } from '@/components/hacker/LocationModal';
import { ErrorPanel } from '@/components/hacker/ErrorPanel';
import type { Stage } from '@/types/photo';

const SKIPPABLE: Stage[] = ['scanning', 'processing', 'reveal', 'gps', 'flash'];

const STAGE_LABEL: Record<Stage, string> = {
  idle: 'STANDBY',
  scanning: 'SCANNING',
  processing: 'PROCESSING',
  reveal: 'DATA REVEAL',
  gps: 'GPS LOCK',
  flash: 'LOCK CONFIRMED',
  result: 'COMPLETE',
  error: 'FAULT',
};

function App() {
  const { state, startScan, skip, reset, closeModal, openModal } = useScanPipeline();
  const durations = getDurations(useReducedMotion());
  const { stage, analysis, previewUrl, errorCode, notice, modalOpen, session } = state;
  const showAnalysis = analysis !== null && stage !== 'idle' && stage !== 'scanning' && stage !== 'processing' && stage !== 'error';

  let stageBody;
  if (stage === 'error' && errorCode) {
    stageBody = <ErrorPanel code={errorCode} onReset={reset} />;
  } else if (stage === 'processing') {
    stageBody = <ProcessingStage durationMs={durations.PROCESS_MS} />;
  } else if (showAnalysis && analysis) {
    stageBody = (
      <DataReveal analysis={analysis} durationMs={durations.REVEAL_MS} instant={stage !== 'reveal'} />
    );
  } else {
    stageBody = (
      <HudPanel title="ANALYSIS CORE" status={STAGE_LABEL[stage]} className="stage-panel" bodyClassName="stage-body">
        <p className="standby-text">
          {stage === 'idle'
            ? 'Jatuhkan foto ke panel target untuk memulai analisis. Semua proses berjalan di browser Anda.'
            : 'Pemindaian gambar sedang berjalan...'}
        </p>
      </HudPanel>
    );
  }

  return (
    <div className="app">
      <MatrixRain paused={modalOpen} />
      <div className="crt" aria-hidden="true" />

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <h1 className="brand-title glitch-text" data-text="METADATA SCANNER">METADATA SCANNER</h1>
            <p className="brand-sub">
              <span className="dot" aria-hidden="true" />
              {STAGE_LABEL[stage]} · v2
            </p>
          </div>
          <div className="toolbar">
            {SKIPPABLE.includes(stage) && (
              <button type="button" className="btn btn-ghost btn-small" onClick={() => void skip()} aria-label="Lewati animasi dan tampilkan hasil">
                Skip animation
              </button>
            )}
            <button type="button" className="btn btn-small" onClick={reset} aria-label="Mulai pemindaian baru dan reset">
              NEW SCAN / RESET
            </button>
          </div>
        </header>

        {notice && <p className="notice" role="status">{notice}</p>}

        <main className="grid">
          <div className="col col-left">
            <ImagePanel key={session} stage={stage} previewUrl={previewUrl} onFiles={startScan} />
            <HudPanel title="SYSTEM LOG" status="LIVE" tone="green" className="log-panel" bodyClassName="log-body">
              <LogTerminal key={session} stage={stage} />
            </HudPanel>
          </div>

          <div className="col col-right">
            {stageBody}
            <GpsPanel
              stage={stage}
              analysis={showAnalysis ? analysis : null}
              durationMs={durations.GPS_LOCK_MS}
              onOpenMap={openModal}
            />
          </div>

          {showAnalysis && analysis && (
            <details className="raw-panel">
              <summary>Semua tag mentah</summary>
              <table className="raw-table">
                <tbody>
                  {analysis.rawRows
                    .filter(([, v]) => v !== undefined && v !== null && v !== '')
                    .map(([k, v]) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>{String(v)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </details>
          )}
        </main>

        {modalOpen && analysis?.hasGPS && (
          <LocationModal lat={analysis.lat} lng={analysis.lng} alt={analysis.alt} onClose={closeModal} />
        )}
      </div>
    </div>
  );
}

export default App;
