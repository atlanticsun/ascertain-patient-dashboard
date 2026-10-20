import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface SliceDatum {
  status: string;
  count: number;
  color: string;
}

interface Props {
  slices: SliceDatum[];
  total: number;
}

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 108;
const INNER_R = 68;
const HOVER_PUSH = 10;

function polar(angle: number, radius: number): [number, number] {
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)];
}

/* A donut wedge path. Angles are in radians. */
function wedgePath(start: number, end: number): string {
  const full = end - start >= Math.PI * 2 - 1e-6;
  if (full) {
    // A full ring needs two arcs; a single arc cannot close a circle.
    const [x1, y1] = polar(0, OUTER_R);
    const [x2, y2] = polar(Math.PI, OUTER_R);
    const [x3, y3] = polar(Math.PI, INNER_R);
    const [x4, y4] = polar(0, INNER_R);
    return [
      `M ${x1} ${y1}`,
      `A ${OUTER_R} ${OUTER_R} 0 1 1 ${x2} ${y2}`,
      `A ${OUTER_R} ${OUTER_R} 0 1 1 ${x1} ${y1}`,
      `L ${x4} ${y4}`,
      `A ${INNER_R} ${INNER_R} 0 1 0 ${x3} ${y3}`,
      `A ${INNER_R} ${INNER_R} 0 1 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');
  }
  const large = end - start > Math.PI ? 1 : 0;
  const [ox1, oy1] = polar(start, OUTER_R);
  const [ox2, oy2] = polar(end, OUTER_R);
  const [ix2, iy2] = polar(end, INNER_R);
  const [ix1, iy1] = polar(start, INNER_R);
  return [
    `M ${ox1} ${oy1}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${ix1} ${iy1}`,
    'Z',
  ].join(' ');
}

/* Interactive donut chart of patients by status. Hovering a slice pushes it
   outward and updates the center label; clicking a slice opens the patient
   list pre filtered to that status. No chart library needed. */
export default function StatusPieChart({ slices, total }: Props) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  let angle = -Math.PI / 2;
  const laid = slices
    .filter((s) => s.count > 0)
    .map((s) => {
      const start = angle;
      const sweep = total > 0 ? (s.count / total) * Math.PI * 2 : 0;
      angle = start + sweep;
      return { ...s, start, end: start + sweep, mid: start + sweep / 2 };
    });

  const hoveredSlice = laid.find((s) => s.status === hovered) ?? null;

  function openFiltered(status: string) {
    navigate(`/patients?status=${encodeURIComponent(status)}`);
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="group"
          aria-label="Patients by status"
        >
          {laid.map((s, i) => {
            const isHover = hovered === s.status;
            const dx = isHover ? Math.cos(s.mid) * HOVER_PUSH : 0;
            const dy = isHover ? Math.sin(s.mid) * HOVER_PUSH : 0;
            return (
              <path
                key={s.status}
                d={wedgePath(s.start, s.end)}
                fill={s.color}
                className="pie-slice"
                style={{
                  transform: `translate(${dx}px, ${dy}px)`,
                  animationDelay: `${i * 0.1}s`,
                }}
                role="button"
                tabIndex={0}
                aria-label={`${s.status}: ${s.count} patients. Activate to filter the list.`}
                onMouseEnter={() => setHovered(s.status)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.status)}
                onBlur={() => setHovered(null)}
                onClick={() => openFiltered(s.status)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openFiltered(s.status);
                  }
                }}
              />
            );
          })}
        </svg>
        {/* Center readout: total at rest, slice detail on hover. Never shows a
            text cursor or allows selection; it is a readout, not content. */}
        <div
          className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center"
          aria-live="polite"
        >
          <div
            key={hoveredSlice?.status ?? 'total'}
            className="pie-center flex flex-col items-center"
          >
            <span className="text-3xl font-bold text-ink-900">
              {hoveredSlice ? hoveredSlice.count : total}
            </span>
            <span className="text-xs font-medium capitalize text-ink-500">
              {hoveredSlice
                ? `${hoveredSlice.status} · ${Math.round((hoveredSlice.count / total) * 100)}%`
                : 'patients'}
            </span>
          </div>
        </div>
      </div>

      <ul className="flex w-full max-w-xs flex-col gap-1">
        {laid.map((s) => {
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          const isHover = hovered === s.status;
          return (
            <li key={s.status}>
              <button
                type="button"
                onClick={() => openFiltered(s.status)}
                onMouseEnter={() => setHovered(s.status)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.status)}
                onBlur={() => setHovered(null)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                  isHover ? 'bg-teal-50 shadow-sm' : 'hover:bg-mist-100'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: s.color,
                    transform: isHover ? 'scale(1.3)' : undefined,
                  }}
                />
                <span className="font-medium capitalize text-ink-700">{s.status}</span>
                <span className="ml-auto font-semibold text-ink-900">{s.count}</span>
                <span className="w-10 text-right text-xs text-ink-500">{pct}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
