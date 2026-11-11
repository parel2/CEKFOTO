import { useEffect, useRef, useState } from 'react';

interface CopyCoordsButtonProps {
  lat: number;
  lng: number;
  className?: string;
  label?: string;
}

export function CopyCoordsButton({ lat, lng, className = 'btn', label = 'Salin Koordinat' }: CopyCoordsButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = () => {
    navigator.clipboard?.writeText(`${lat}, ${lng}`).catch(() => undefined);
    setCopied(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button type="button" className={className} onClick={copy} aria-label="Salin koordinat ke papan klip">
      {copied ? 'TERSALIN' : label}
    </button>
  );
}
