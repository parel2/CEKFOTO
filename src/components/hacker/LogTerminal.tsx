import { useCallback, useEffect, useRef, useState } from 'react';
import { TIMING } from '@/config/timing';
import { LOG_SCRIPT, type LogEntry } from '@/lib/logScript';
import { randBetween, timestamp } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useMotion';
import type { Stage } from '@/types/photo';

interface LogRow {
  id: number;
  stamp: string;
  tag: LogEntry['tag'];
  text: string;
  done: boolean;
}

interface LogTerminalProps {
  stage: Stage;
}

export function LogTerminal({ stage }: LogTerminalProps) {
  const reduced = useReducedMotion();
  const [rows, setRows] = useState<LogRow[]>([]);
  const queueRef = useRef<LogEntry[]>([]);
  const busyRef = useRef(false);
  const nextIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const scrollRef = useRef<HTMLDivElement>(null);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const pump = useCallback(() => {
    const entry = queueRef.current.shift();
    if (!entry) {
      busyRef.current = false;
      return;
    }
    const id = nextIdRef.current++;
    const stamp = timestamp();
    const factor = reducedRef.current ? TIMING.REDUCED_MOTION_FACTOR : 1;
    setRows(prev => [...prev, { id, stamp, tag: entry.tag, text: '', done: false }].slice(-TIMING.LOG_MAX_ROWS));

    let i = 0;
    const typeNext = () => {
      i++;
      const text = entry.text.slice(0, i);
      const done = i >= entry.text.length;
      setRows(prev => prev.map(r => (r.id === id ? { ...r, text, done } : r)));
      if (!done) {
        schedule(typeNext, TIMING.LOG_CHAR_MS * (reducedRef.current ? 0.3 : 1));
      } else {
        schedule(pump, randBetween(TIMING.LOG_GAP_MIN_MS, TIMING.LOG_GAP_MAX_MS) * factor);
      }
    };
    schedule(typeNext, TIMING.LOG_CHAR_MS);
  }, [schedule]);

  useEffect(() => {
    queueRef.current.push(...LOG_SCRIPT[stage]);
    if (!busyRef.current) {
      busyRef.current = true;
      pump();
    }
  }, [stage, pump]);

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    queueRef.current = [];
    busyRef.current = false;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rows]);

  return (
    <div className="log-terminal" ref={scrollRef} role="log" aria-live="polite" aria-relevant="additions">
      {rows.map(r => (
        <div key={r.id} className="log-row">
          <span className="log-stamp">[{r.stamp}]</span>{' '}
          <span className={`log-tag log-tag-${r.tag === '..' ? 'wait' : r.tag.toLowerCase()}`}>
            [{r.tag}]
          </span>{' '}
          <span className="log-text">
            {r.text}
            {!r.done && <span className="log-caret" aria-hidden="true" />}
          </span>
        </div>
      ))}
    </div>
  );
}
