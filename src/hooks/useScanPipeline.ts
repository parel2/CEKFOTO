import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeImage } from '@/lib/metadata';
import { isAbortError, sleep } from '@/lib/utils';
import { getDurations, useReducedMotion } from '@/hooks/useMotion';
import type { ErrorCode, PhotoAnalysis, Stage } from '@/types/photo';

interface PipelineState {
  stage: Stage;
  session: number;
  previewUrl: string | null;
  analysis: PhotoAnalysis | null;
  errorCode: ErrorCode | null;
  notice: string | null;
  modalOpen: boolean;
}

interface ActiveRun {
  ctrl: AbortController;
  url: string;
  analysis: Promise<PhotoAnalysis | null>;
}

const initialState: PipelineState = {
  stage: 'idle',
  session: 0,
  previewUrl: null,
  analysis: null,
  errorCode: null,
  notice: null,
  modalOpen: false,
};

export function useScanPipeline() {
  const durations = getDurations(useReducedMotion());
  const [state, setState] = useState<PipelineState>(initialState);
  const runRef = useRef<ActiveRun | null>(null);
  const durationsRef = useRef(durations);
  durationsRef.current = durations;

  const cancelRun = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    run.ctrl.abort();
    URL.revokeObjectURL(run.url);
    runRef.current = null;
  }, []);

  useEffect(() => cancelRun, [cancelRun]);

  const fail = useCallback((run: ActiveRun, errorCode: ErrorCode) => {
    if (runRef.current !== run) return;
    setState(s => ({ ...s, stage: 'error', errorCode }));
  }, []);

  const play = useCallback(async (run: ActiveRun) => {
    const d = durationsRef.current;
    const { signal } = run.ctrl;
    try {
      setState(s => ({ ...s, stage: 'scanning' }));
      await sleep(d.SCAN_MS, signal);
      setState(s => ({ ...s, stage: 'processing' }));
      await sleep(d.PROCESS_MS, signal);

      const analysis = await run.analysis;
      if (signal.aborted) return;
      if (!analysis) return fail(run, 'UNREADABLE');
      if (!analysis.hasMetadata) return fail(run, 'NO_METADATA');

      setState(s => ({ ...s, stage: 'reveal', analysis }));
      await sleep(d.REVEAL_MS, signal);
      setState(s => ({ ...s, stage: 'gps' }));
      await sleep(d.GPS_LOCK_MS, signal);

      if (analysis.hasGPS) {
        setState(s => ({ ...s, stage: 'flash' }));
        await sleep(d.POPUP_DELAY_MS, signal);
        setState(s => ({ ...s, stage: 'result', modalOpen: true }));
      } else {
        setState(s => ({ ...s, stage: 'result' }));
      }
    } catch (e) {
      if (!isAbortError(e)) throw e;
    }
  }, [fail]);

  const startScan = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    cancelRun();

    const notice = files.length > 1
      ? `${files.length} file dijatuhkan, hanya file pertama yang diproses.`
      : null;

    if (file.type && !file.type.startsWith('image/')) {
      setState(s => ({ ...initialState, session: s.session + 1, stage: 'error', errorCode: 'NOT_IMAGE', notice }));
      return;
    }

    const url = URL.createObjectURL(file);
    const run: ActiveRun = {
      ctrl: new AbortController(),
      url,
      analysis: analyzeImage(file, url).catch(() => null),
    };
    runRef.current = run;
    setState(s => ({ ...initialState, session: s.session + 1, previewUrl: url, notice }));
    void play(run);
  }, [cancelRun, play]);

  const skip = useCallback(async () => {
    const run = runRef.current;
    if (!run) return;
    run.ctrl.abort();
    const analysis = await run.analysis;
    if (runRef.current !== run) return;
    if (!analysis) return fail(run, 'UNREADABLE');
    if (!analysis.hasMetadata) return fail(run, 'NO_METADATA');
    setState(s => ({ ...s, stage: 'result', analysis, modalOpen: analysis.hasGPS }));
  }, [fail]);

  const reset = useCallback(() => {
    cancelRun();
    setState(s => ({ ...initialState, session: s.session + 1 }));
  }, [cancelRun]);

  const closeModal = useCallback(() => {
    setState(s => ({ ...s, modalOpen: false }));
  }, []);

  const openModal = useCallback(() => {
    setState(s => ({ ...s, modalOpen: true }));
  }, []);

  return { state, startScan, skip, reset, closeModal, openModal };
}
