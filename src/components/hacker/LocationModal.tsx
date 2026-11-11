import { useEffect, useRef, useState } from 'react';
import { TIMING } from '@/config/timing';
import { CopyCoordsButton } from '@/components/hacker/CopyCoordsButton';
import { decimalCoord, dmsCoord } from '@/lib/metadata';

interface LocationModalProps {
  lat: number;
  lng: number;
  alt: number | null;
  onClose: () => void;
}

export function LocationModal({ lat, lng, alt, onClose }: LocationModalProps) {
  const [mapState, setMapState] = useState<'loading' | 'loaded' | 'failed'>(
    navigator.onLine ? 'loading' : 'failed'
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (mapState !== 'loading') return;
    const id = window.setTimeout(() => setMapState('failed'), TIMING.MAP_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [mapState]);

  const coord = decimalCoord(lat, lng);
  const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  const openUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-head">
          <h2 id="modal-title" className="modal-title glitch-text" data-text="LOCATION FOUND">LOCATION FOUND</h2>
          <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Tutup popup">
            ×
          </button>
        </header>
        <div className="modal-body">
          <div className="map-frame">
            {mapState === 'failed' ? (
              <div className="map-fallback">Peta tidak dapat dimuat. Gunakan koordinat di bawah atau buka di Google Maps.</div>
            ) : (
              <iframe
                title="Peta lokasi foto"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setMapState('loaded')}
              />
            )}
          </div>
          <p className="modal-coord">{coord}</p>
          <p className="modal-dms">{dmsCoord(lat, lng)}{alt !== null ? ` · alt ${alt} m` : ''}</p>
          <div className="modal-actions">
            <a className="btn btn-primary" href={openUrl} target="_blank" rel="noopener noreferrer">
              Buka di Google Maps
            </a>
            <CopyCoordsButton lat={lat} lng={lng} />
          </div>
        </div>
      </div>
    </div>
  );
}
