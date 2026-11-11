import { HudPanel } from '@/components/hacker/HudPanel';
import type { ErrorCode } from '@/types/photo';

const MESSAGES: Record<ErrorCode, { title: string; detail: string }> = {
  NOT_IMAGE: {
    title: 'INVALID TARGET TYPE',
    detail: 'File yang dijatuhkan bukan gambar. Pilih file JPG, PNG, WEBP, atau format gambar lain.',
  },
  UNREADABLE: {
    title: 'TARGET UNREADABLE',
    detail: 'Gambar tidak bisa dibaca oleh browser. File mungkin rusak atau formatnya tidak didukung.',
  },
  NO_METADATA: {
    title: 'NO METADATA DETECTED',
    detail: 'Foto ini tidak memiliki metadata. Biasanya metadata sudah dihapus oleh WhatsApp atau media sosial.',
  },
};

interface ErrorPanelProps {
  code: ErrorCode;
  onReset: () => void;
}

export function ErrorPanel({ code, onReset }: ErrorPanelProps) {
  const msg = MESSAGES[code];
  return (
    <HudPanel title="SYSTEM FAULT" status="ERROR" tone="red" className="stage-panel" bodyClassName="stage-body">
      <div className="error-body" role="alert">
        <p className="error-title glitch-text" data-text={msg.title}>{msg.title}</p>
        <p className="error-detail">{msg.detail}</p>
        <button type="button" className="btn btn-danger" onClick={onReset}>RESET</button>
      </div>
    </HudPanel>
  );
}
