import { useMemo } from 'react';
import { randBetween } from '@/lib/utils';

const BAR_COUNT = 24;
const NODE_COUNT = 8;

export function SideGraphs() {
  const bars = useMemo(() => Array.from({ length: BAR_COUNT }, () => ({
    dur: randBetween(0.5, 1.4),
    delay: randBetween(0, 1),
    height: randBetween(30, 100),
  })), []);
  const nodes = useMemo(() => Array.from({ length: NODE_COUNT }, () => ({
    x: randBetween(10, 90),
    y: randBetween(10, 90),
    delay: randBetween(0, 2),
  })), []);

  return (
    <div className="side-graphs" aria-hidden="true">
      <div className="side-block">
        <span className="side-label">AUDIO WAVE</span>
        <div className="eq">
          {bars.map((b, i) => (
            <span
              key={i}
              className="eq-bar"
              style={{ animationDuration: `${b.dur}s`, animationDelay: `-${b.delay}s`, height: `${b.height}%` }}
            />
          ))}
        </div>
      </div>
      <div className="side-block">
        <span className="side-label">NODE NETWORK</span>
        <div className="net">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="net-lines">
            {nodes.slice(1).map((n, i) => (
              <line key={i} x1={nodes[0].x} y1={nodes[0].y} x2={n.x} y2={n.y} />
            ))}
          </svg>
          {nodes.map((n, i) => (
            <span
              key={i}
              className="net-node"
              style={{ left: `${n.x}%`, top: `${n.y}%`, animationDelay: `-${n.delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
