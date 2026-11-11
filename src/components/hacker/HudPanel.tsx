import type { ReactNode } from 'react';

interface HudPanelProps {
  title: string;
  status?: ReactNode;
  tone?: 'cyan' | 'green' | 'red';
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function HudPanel({ title, status, tone = 'cyan', className = '', bodyClassName = '', children }: HudPanelProps) {
  return (
    <section className={`hud-panel hud-tone-${tone} ${className}`}>
      <span className="hud-corner hud-tl" aria-hidden="true" />
      <span className="hud-corner hud-tr" aria-hidden="true" />
      <span className="hud-corner hud-bl" aria-hidden="true" />
      <span className="hud-corner hud-br" aria-hidden="true" />
      <header className="hud-head">
        <span className="hud-title">{title}</span>
        {status !== undefined && <span className="hud-status">{status}</span>}
      </header>
      <div className={`hud-body ${bodyClassName}`}>{children}</div>
    </section>
  );
}
