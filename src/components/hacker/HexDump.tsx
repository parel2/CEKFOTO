import { useEffect, useMemo, useState } from 'react';
import { randBetween } from '@/lib/utils';

const ROW_COUNT = 64;
const BYTES_PER_ROW = 16;

function randomByte(): string {
  return Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
}

export function HexDump() {
  const rows = useMemo(() => {
    const header = ['FF', 'D8', 'FF', 'E1'];
    return Array.from({ length: ROW_COUNT }, (_, r) => {
      const bytes = Array.from({ length: BYTES_PER_ROW }, (_, c) =>
        r === 0 && c < header.length ? header[c] : randomByte()
      );
      return {
        offset: (r * BYTES_PER_ROW).toString(16).toUpperCase().padStart(6, '0'),
        bytes,
      };
    });
  }, []);

  const [hot, setHot] = useState<number[]>([]);
  useEffect(() => {
    const id = window.setInterval(() => {
      setHot(Array.from({ length: 3 }, () => Math.floor(Math.random() * ROW_COUNT * BYTES_PER_ROW)));
    }, 260);
    return () => window.clearInterval(id);
  }, []);

  const duration = useMemo(() => randBetween(18, 26), []);

  return (
    <div className="hex-window" aria-hidden="true">
      <div className="hex-scroll" style={{ animationDuration: `${duration}s` }}>
        {[...rows, ...rows].map((row, r) => (
          <div key={r} className="hex-row">
            <span className="hex-offset">{row.offset}</span>
            {row.bytes.map((b, c) => {
              const index = (r % ROW_COUNT) * BYTES_PER_ROW + c;
              return (
                <span key={c} className={`hex-byte ${hot.includes(index) ? 'is-hot' : ''}`}>{b}</span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
