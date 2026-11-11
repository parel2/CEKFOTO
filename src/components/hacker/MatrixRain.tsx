import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useMotion';

const RAIN_CHARS = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF';
const FONT_SIZE = 16;

export function MatrixRain({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drops: number[] = [];
    let frame = 0;
    let rafId = 0;
    let hidden = document.hidden;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.ceil(canvas.width / FONT_SIZE);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      if (hidden || pausedRef.current) return;
      frame++;
      if (frame % 3 !== 0) return;
      ctx.fillStyle = 'rgba(5, 7, 10, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px ui-monospace, Consolas, monospace`;
      drops.forEach((y, i) => {
        const char = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
        ctx.fillStyle = Math.random() > 0.97 ? '#e6fff4' : '#00ff9c';
        ctx.fillText(char, i * FONT_SIZE, y * FONT_SIZE);
        drops[i] = y * FONT_SIZE > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };

    const onVisibility = () => { hidden = document.hidden; };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={canvasRef} className="matrix-rain" aria-hidden="true" />;
}
