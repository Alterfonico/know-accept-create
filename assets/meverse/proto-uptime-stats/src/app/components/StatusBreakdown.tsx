import { useState } from "react";

const PIXEL_FONT = "'Press Start 2P', monospace";

type Status = "NOMINAL" | "DEGRADED" | "CRITICAL";

interface SubMetric {
  label: string;
  value: string;
}

interface Category {
  id: string;
  label: string;
  shortLabel: string;
  score: number;
  status: Status;
  color: string;
  icon: React.ReactNode;
  sub: SubMetric[];
  trend: number[]; // sparkline
}

const STATUS_COLOR: Record<Status, string> = {
  NOMINAL: "#4CAF50",
  DEGRADED: "#FF9800",
  CRITICAL: "#F44336",
};

/* ── Pixel Icons ── */
const InternalCommIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="0" y="6" width="5" height="5" fill={color} />
    <rect x="13" y="6" width="5" height="5" fill={color} />
    <rect x="5" y="8" width="8" height="1" fill={color} />
    <rect x="7" y="5" width="1" height="4" fill={color} />
    <rect x="10" y="5" width="1" height="4" fill={color} />
    <rect x="6" y="2" width="6" height="3" fill={color} opacity="0.5" />
    <rect x="6" y="13" width="6" height="3" fill={color} opacity="0.5" />
  </svg>
);

const ExternalCommIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="3" y="12" width="12" height="2" fill={color} />
    <rect x="5" y="9" width="8" height="2" fill={color} opacity="0.8" />
    <rect x="7" y="6" width="4" height="2" fill={color} opacity="0.6" />
    <rect x="8" y="3" width="2" height="2" fill={color} opacity="0.4" />
    <rect x="8" y="14" width="2" height="4" fill={color} />
  </svg>
);

const InputAccuracyIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="0" y="2" width="18" height="14" fill="none" stroke={color} strokeWidth="1.5" />
    <rect x="2" y="5" width="6" height="2" fill={color} opacity="0.5" />
    <rect x="2" y="9" width="10" height="2" fill={color} opacity="0.5" />
    <rect x="2" y="13" width="4" height="1" fill={color} opacity="0.3" />
    <rect x="12" y="6" width="4" height="4" fill={color} />
    <rect x="13" y="5" width="2" height="1" fill={color} />
    <rect x="11" y="9" width="1" height="2" fill={color} />
    <rect x="14" y="9" width="1" height="2" fill={color} />
  </svg>
);

const BalanceIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="8" y="1" width="2" height="14" fill={color} />
    <rect x="2" y="13" width="14" height="2" fill={color} />
    <rect x="1" y="7" width="5" height="5" fill={color} opacity="0.8" />
    <rect x="12" y="9" width="5" height="3" fill={color} opacity="0.6" />
    <rect x="3" y="4" width="3" height="3" fill={color} opacity="0.3" />
    <rect x="8" y="0" width="2" height="2" fill={color} />
  </svg>
);

const CATEGORIES: Category[] = [
  {
    id: "internal",
    label: "INTERNAL COMM",
    shortLabel: "INT.COMM",
    score: 94.7,
    status: "NOMINAL",
    color: "#4CAF50",
    icon: <InternalCommIcon color="#4CAF50" />,
    sub: [
      { label: "LATENCY", value: "12ms" },
      { label: "PKT LOSS", value: "0.2%" },
      { label: "NODES UP", value: "18/18" },
    ],
    trend: [88, 91, 90, 94, 93, 95, 94],
  },
  {
    id: "external",
    label: "EXTERNAL COMM",
    shortLabel: "EXT.COMM",
    score: 81.3,
    status: "DEGRADED",
    color: "#FF9800",
    icon: <ExternalCommIcon color="#FF9800" />,
    sub: [
      { label: "LATENCY", value: "248ms" },
      { label: "TIMEOUTS", value: "14" },
      { label: "SUCCESS", value: "81%" },
    ],
    trend: [95, 90, 84, 78, 82, 80, 81],
  },
  {
    id: "accuracy",
    label: "INPUT ACCURACY",
    shortLabel: "IN.ACCUR",
    score: 99.1,
    status: "NOMINAL",
    color: "#4CAF50",
    icon: <InputAccuracyIcon color="#4CAF50" />,
    sub: [
      { label: "VALID", value: "99.1%" },
      { label: "REJECTED", value: "0.9%" },
      { label: "PARSED", value: "14.2K" },
    ],
    trend: [98, 99, 99, 100, 99, 99, 99],
  },
  {
    id: "balance",
    label: "BALANCE",
    shortLabel: "BALANCE",
    score: 67.4,
    status: "CRITICAL",
    color: "#F44336",
    icon: <BalanceIcon color="#F44336" />,
    sub: [
      { label: "LOAD δ", value: "±32%" },
      { label: "PEAK NODE", value: "N-07" },
      { label: "DRIFT", value: "HIGH" },
    ],
    trend: [85, 79, 72, 68, 71, 65, 67],
  },
];

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 16;
  const w = 4;
  const gap = 2;
  const totalW = values.length * w + (values.length - 1) * gap;

  return (
    <svg width={totalW} height={h} viewBox={`0 0 ${totalW} ${h}`} fill="none">
      {values.map((v, i) => {
        const barH = Math.max(2, Math.round(((v - min) / range) * (h - 2)) + 1);
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={h - barH}
            width={w}
            height={barH}
            fill={color}
            opacity={i === values.length - 1 ? 1 : 0.45 + (i / values.length) * 0.45}
          />
        );
      })}
    </svg>
  );
}

function CategoryCard({ cat, expanded, onToggle }: {
  cat: Category;
  expanded: boolean;
  onToggle: () => void;
}) {
  const barW = Math.round(cat.score);

  return (
    <div
      className="flex flex-col cursor-pointer"
      style={{
        border: `1px solid ${expanded ? cat.color : "#2A2A2A"}`,
        background: expanded ? `${cat.color}08` : "#111",
        transition: "border-color 0.1s, background 0.1s",
      }}
      onClick={onToggle}
    >
      {/* Card header row */}
      <div className="flex items-center gap-2 p-2">
        {/* Icon */}
        <div
          className="flex items-center justify-center w-7 h-7 flex-shrink-0"
          style={{
            background: `${cat.color}18`,
            border: `1px solid ${cat.color}44`,
          }}
        >
          {cat.icon}
        </div>

        {/* Label + bar */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span
              className="text-[5.5px] truncate"
              style={{ fontFamily: PIXEL_FONT, color: "#999" }}
            >
              {cat.label}
            </span>
            <span
              className="text-[6px] flex-shrink-0"
              style={{ fontFamily: PIXEL_FONT, color: cat.color }}
            >
              {cat.score.toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-2"
            style={{ background: "#1E1E1E", border: "1px solid #2A2A2A" }}
          >
            <div
              className="h-full relative"
              style={{
                width: `${barW}%`,
                background: cat.color,
                boxShadow: `0 0 8px ${cat.color}88`,
              }}
            >
              {/* Pixel "notch" effect on bar */}
              <div
                className="absolute right-0 top-0 w-px h-full"
                style={{ background: "#fff", opacity: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Status badge + sparkline */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div
            className="px-1 py-0.5"
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: "4.5px",
              color: cat.color,
              border: `1px solid ${cat.color}55`,
              background: `${cat.color}11`,
              lineHeight: 1,
            }}
          >
            {cat.status}
          </div>
          <Sparkline values={cat.trend} color={cat.color} />
        </div>
      </div>

      {/* Expanded sub-metrics */}
      {expanded && (
        <div
          className="flex gap-0 mx-2 mb-2"
          style={{ borderTop: `1px dashed ${cat.color}33` }}
        >
          {cat.sub.map((s, i) => (
            <div
              key={s.label}
              className="flex-1 flex flex-col items-center gap-1 pt-2 pb-1"
              style={{
                borderRight: i < cat.sub.length - 1 ? `1px dashed ${cat.color}22` : "none",
              }}
            >
              <span
                style={{ fontFamily: PIXEL_FONT, fontSize: "4px", color: "#555" }}
              >
                {s.label}
              </span>
              <span
                style={{ fontFamily: PIXEL_FONT, fontSize: "6.5px", color: cat.color }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StatusBreakdown() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  const overall = CATEGORIES.reduce((acc, c) => acc + c.score, 0) / CATEGORIES.length;
  const overallStatus: Status =
    overall >= 90 ? "NOMINAL" : overall >= 75 ? "DEGRADED" : "CRITICAL";

  return (
    <div
      className="mt-5"
      style={{ border: "1px solid #2A2A2A", background: "#0E0E0E" }}
    >
      {/* Section header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid #222" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-4" style={{ background: "#9D50BB" }} />
          <span
            style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#9D50BB" }}
          >
            SYSTEM STATUS BREAKDOWN
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: "5px",
              color: STATUS_COLOR[overallStatus],
            }}
          >
            AVG {overall.toFixed(1)}%
          </span>
          <div
            className="w-1.5 h-1.5 animate-pulse"
            style={{
              background: STATUS_COLOR[overallStatus],
              boxShadow: `0 0 6px ${STATUS_COLOR[overallStatus]}`,
            }}
          />
        </div>
      </div>

      {/* Hint */}
      <div className="px-3 pt-2 pb-1">
        <span style={{ fontFamily: PIXEL_FONT, fontSize: "4px", color: "#333" }}>
          ▶ TAP ROW TO EXPAND
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-1.5 px-2 pb-3">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            expanded={expanded === cat.id}
            onToggle={() => toggle(cat.id)}
          />
        ))}
      </div>

      {/* Footer aggregate row */}
      <div
        className="flex border-t"
        style={{ borderColor: "#1E1E1E" }}
      >
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.id}
            className="flex-1 flex flex-col items-center py-2 gap-1"
            style={{
              borderRight: i < CATEGORIES.length - 1 ? "1px solid #1E1E1E" : "none",
            }}
          >
            <div
              className="w-2.5 h-2.5"
              style={{
                background: cat.color,
                boxShadow: `0 0 5px ${cat.color}`,
              }}
            />
            <span
              style={{ fontFamily: PIXEL_FONT, fontSize: "4px", color: "#444" }}
            >
              {cat.shortLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}