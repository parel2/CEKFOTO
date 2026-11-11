import { useEffect, useState, type CSSProperties } from 'react';
import { useScramble } from '@/hooks/useScramble';

const CRYPTO_LINES = [
  'DERIVING AES-256 KEY...',
  'XOR STREAM 0x7F3A ... OK',
  'PARSING TAG 0x8825 ...',
  'RESOLVING ENDIAN BOM...',
  'REBUILDING IFD OFFSET TABLE...',
];

function randomBits(): string {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 28 }, () => (Math.random() > 0.5 ? '1' : '0')).join('')
  ).join('\n');
}

interface DecryptGaugeProps {
  value: number;
}

export function DecryptGauge({ value }: DecryptGaugeProps) {
  const [line, setLine] = useState(0);
  const [bits, setBits] = useState(randomBits);
  const scrambled = useScramble(CRYPTO_LINES[line], true, 1100);

  useEffect(() => {
    const lineId = window.setInterval(() => setLine(i => (i + 1) % CRYPTO_LINES.length), 1600);
    const bitsId = window.setInterval(() => setBits(randomBits()), 180);
    return () => {
      window.clearInterval(lineId);
      window.clearInterval(bitsId);
    };
  }, []);

  const pct = Math.round(value);
  return (
    <div className="decrypt">
      <div className="gauge" style={{ '--p': pct } as CSSProperties} aria-hidden="true">
        <span className="gauge-spin" />
        <span className="gauge-core">{pct}%</span>
      </div>
      <div className="decrypt-side">
        <p className="decrypt-line" aria-live="off">{scrambled}</p>
        <pre className="bit-stream" aria-hidden="true">{bits}</pre>
      </div>
    </div>
  );
}
