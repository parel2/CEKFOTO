import { useEffect, useMemo, useState } from 'react';
import { useScramble } from '@/hooks/useScramble';
import { HudPanel } from '@/components/hacker/HudPanel';
import type { CSSProperties } from 'react';
import type { PhotoAnalysis, Row } from '@/types/photo';

interface DataRevealProps {
  analysis: PhotoAnalysis;
  durationMs: number;
  instant: boolean;
}

interface Field {
  group: string;
  label: string;
  value: string | number | null | undefined;
}

function toFields(analysis: PhotoAnalysis): Field[] {
  const tag = (group: string) => ([label, value]: Row): Field => ({ group, label, value });
  return [
    ...analysis.summaryRows.map(tag('IMAGE SUMMARY')),
    ...analysis.exifRows.map(tag('DETAIL EXIF')),
  ];
}

const hasValue = (v: Field['value']) => v !== undefined && v !== null && v !== '';

function FieldRow({ field, animate }: { field: Field; animate: boolean }) {
  const text = hasValue(field.value) ? String(field.value) : '';
  const shown = useScramble(text, animate && text !== '', 700);
  const missing = !hasValue(field.value);
  return (
    <div className={`field-row ${missing ? 'is-missing' : ''}`}>
      <span className="field-label">{field.label}</span>
      <span className="field-value">{missing ? 'NOT FOUND' : shown}</span>
    </div>
  );
}

export function DataReveal({ analysis, durationMs, instant }: DataRevealProps) {
  const fields = useMemo(() => toFields(analysis), [analysis]);
  const total = fields.length;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (instant) return;
    const weights = fields.map(() => 0.7 + Math.random() * 0.6);
    const sum = weights.reduce((a, b) => a + b, 0);
    const span = durationMs * 0.9;
    let acc = 0;
    const ids = weights.map((w, i) => {
      acc += (w / sum) * span;
      return window.setTimeout(() => setCount(i + 1), acc);
    });
    return () => ids.forEach(window.clearTimeout);
  }, [fields, durationMs, instant]);

  const shown = instant ? total : count;
  const complete = shown >= total;
  const [flicker, setFlicker] = useState(!instant);
  useEffect(() => {
    if (!flicker) return;
    const id = window.setTimeout(() => setFlicker(false), 600);
    return () => window.clearTimeout(id);
  }, [flicker]);

  const groups = Array.from(new Set(fields.map(f => f.group)));

  return (
    <HudPanel title="DATA REVEAL" status={complete ? 'DECODED' : `${shown}/${total}`} tone="cyan" className="stage-panel" bodyClassName="stage-body">
      <div className="reveal-scroll">
        {flicker && <div className="reveal-flicker" aria-hidden="true" />}
        {groups.map(group => (
          <section key={group} className="reveal-group">
            <h4 className="reveal-group-title">{group}</h4>
            {fields.map((f, i) => {
              if (f.group !== group || i >= shown) return null;
              return <FieldRow key={i} field={f} animate={!instant} />;
            })}
          </section>
        ))}
        {complete && (
          <section className="health" aria-label="Metadata health">
            <div className="ring" style={{ '--p': analysis.score } as CSSProperties}>
              <span>{analysis.score}%</span>
            </div>
            <div className="pills">
              {analysis.checks.map(c => (
                <div key={c.label} className={`pill ${c.ok ? 'is-ok' : 'is-no'}`}>
                  <b>{c.ok ? 'OK' : '!'}</b>
                  {c.label}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </HudPanel>
  );
}
