import { useMemo, useRef, useState, type DragEvent } from 'react';
import { useElapsed } from '@/hooks/useElapsed';
import { useReducedMotion } from '@/hooks/useMotion';
import { HudPanel } from '@/components/hacker/HudPanel';
import { ScanOverlay } from '@/components/hacker/ScanOverlay';
import type { Stage } from '@/types/photo';
import { TIMING } from '@/config/timing';

interface ImagePanelProps {
  stage: Stage;
  previewUrl: string | null;
  onFiles: (files: File[]) => void;
}

const STATUS_BY_STAGE: Partial<Record<Stage, string>> = {
  processing: 'IMAGE LOCKED, PROCESSING...',
  reveal: 'DATA EXTRACTED',
  gps: 'GEO TRACE RUNNING...',
  flash: 'TARGET FOUND',
  result: 'ANALYSIS COMPLETE',
  error: 'INPUT REJECTED',
};

function scanStatus(f: number): string {
  if (f < 0.2) return 'LOADING IMAGE BUFFER...';
  if (f < 0.45) return 'INITIALIZING SCANNER...';
  if (f < 0.7) return 'ANALYZING IMAGE STRUCTURE...';
  return 'MAPPING PIXEL CLUSTERS...';
}

export function ImagePanel({ stage, previewUrl, onFiles }: ImagePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const reduced = useReducedMotion();
  const scanFraction = useElapsed(TIMING.SCAN_MS * (reduced ? TIMING.REDUCED_MOTION_FACTOR : 1), stage === 'scanning');
  const hasPhoto = previewUrl !== null;

  const status = useMemo(() => {
    if (stage === 'scanning') return scanStatus(scanFraction);
    return STATUS_BY_STAGE[stage] ?? 'AWAITING TARGET IMAGE...';
  }, [stage, scanFraction]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    onFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(true);
  };

  return (
    <HudPanel
      title="TARGET IMAGE"
      status={hasPhoto ? 'LOCKED' : 'NO TARGET'}
      className="image-panel"
      bodyClassName="image-body"
    >
      <div
        className={`image-drop ${over ? 'is-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
      >
        {hasPhoto ? (
          <div className="scan-frame">
            {previewFailed ? (
              <div className="preview-fallback">PREVIEW TIDAK DIDUKUNG BROWSER INI. METADATA TETAP DIBACA.</div>
            ) : (
              <img
                key={previewUrl}
                src={previewUrl}
                alt="Foto yang dianalisis"
                className={`scan-image ${stage === 'scanning' ? 'glitch-in' : ''}`}
                onError={() => setPreviewFailed(true)}
              />
            )}
            {(stage === 'scanning' || stage === 'processing') && (
              <ScanOverlay stage={stage} fraction={scanFraction} />
            )}
          </div>
        ) : (
          <button
            type="button"
            className="drop-idle"
            onClick={() => inputRef.current?.click()}
            aria-label="Pilih foto untuk dianalisis, atau seret foto ke area ini"
          >
            <span className="drop-idle-scan" aria-hidden="true" />
            <span className="drop-idle-text blink">AWAITING TARGET IMAGE...</span>
            <span className="drop-idle-cta">[ PILIH FOTO ]</span>
            <span className="drop-idle-hint">Klik atau seret foto ke sini. Foto dibaca di browser, tidak di-upload.</span>
          </button>
        )}
      </div>
      <div className="image-status" aria-live="polite">
        <span className="image-status-dot" aria-hidden="true" />
        <span className="image-status-text">{status}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
    </HudPanel>
  );
}
