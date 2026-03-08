import { useState } from "react";

const nodes = {
  // ACT 1
  splash: { id: "splash", label: "Splash Screen", act: 1, x: 60, y: 80 },
  register: {
    id: "register",
    label: "Register / Login",
    act: 1,
    x: 220,
    y: 80,
  },
  firstCapture: {
    id: "firstCapture",
    label: "First Capture",
    act: 1,
    x: 400,
    y: 80,
  },
  q1a: {
    id: "q1a",
    label: "Home / Log List",
    act: 1,
    x: 590,
    y: 40,
    variant: true,
  },
  q1b: {
    id: "q1b",
    label: "Onboarding Prompt",
    act: 1,
    x: 590,
    y: 110,
    variant: true,
  },
  q1c: {
    id: "q1c",
    label: "Instant Analysis",
    act: 1,
    x: 590,
    y: 180,
    variant: true,
  },

  // ACT 2
  widget: { id: "widget", label: "Lock Screen Widget", act: 2, x: 60, y: 360 },
  input: { id: "input", label: "Input (Auto-save)", act: 2, x: 240, y: 360 },
  confirm: { id: "confirm", label: "Save / Cancel", act: 2, x: 420, y: 360 },
  q2a: {
    id: "q2a",
    label: "Back to Lock Screen",
    act: 2,
    x: 620,
    y: 320,
    variant: true,
  },
  q2b: { id: "q2b", label: "Log List", act: 2, x: 620, y: 390, variant: true },
  q2c: {
    id: "q2c",
    label: "Micro-feedback",
    act: 2,
    x: 620,
    y: 460,
    variant: true,
  },

  // ACT 3
  logList: { id: "logList", label: "Log List", act: 3, x: 60, y: 600 },
  sideNav: { id: "sideNav", label: "Side Nav", act: 3, x: 240, y: 600 },
  uptime: {
    id: "uptime",
    label: "Uptime Visualization",
    act: 3,
    x: 470,
    y: 540,
  },
  fractal: { id: "fractal", label: "Fractal Map View", act: 3, x: 470, y: 660 },
};

const edges = [
  ["splash", "register"],
  ["register", "firstCapture"],
  ["firstCapture", "q1a", true],
  ["firstCapture", "q1b", true],
  ["firstCapture", "q1c", true],
  ["widget", "input"],
  ["input", "confirm"],
  ["confirm", "q2a", true],
  ["confirm", "q2b", true],
  ["confirm", "q2c", true],
  ["logList", "sideNav"],
  ["sideNav", "uptime"],
  ["sideNav", "fractal"],
];

const actMeta = {
  1: {
    label: "ACT I — Hook",
    color: "#7DF9C2",
    desc: "Acquisition + first signal",
  },
  2: { label: "ACT II — Ritual", color: "#FFD166", desc: "Daily capture loop" },
  3: { label: "ACT III — Mirror", color: "#A78BFA", desc: "Pattern → meaning" },
};

export default function FlowDiagram() {
  const [hovered, setHovered] = useState(null);

  const W = 780,
    H = 760;

  function getNode(id) {
    return nodes[id];
  }

  function midArrow(a, b) {
    const na = getNode(a),
      nb = getNode(b);
    const x1 = na.x + 80,
      y1 = na.y + 18;
    const x2 = nb.x,
      y2 = nb.y + 18;
    return { x1, y1, x2, y2 };
  }

  return (
    <div
      style={{
        background: "#0A0A0F",
        minHeight: "100vh",
        fontFamily: "'IBM Plex Mono', monospace",
        padding: "32px 24px",
        color: "#E0E0E0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600&family=Syne:wght@700;800&display=swap');
        .node { cursor: default; transition: all 0.2s; }
        .node:hover rect { filter: brightness(1.3); }
        .variant-node rect { stroke-dasharray: 5,3; opacity: 0.75; }
        .variant-node:hover rect { opacity: 1; }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#fff",
          }}
        >
          MEVERSE — UX ARCHITECTURE
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#555",
            marginTop: 4,
            letterSpacing: "2px",
          }}
        >
          THREE-ACT LOOP · VARIANTS SHOWN AS DASHED
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
        {Object.entries(actMeta).map(([act, m]) => (
          <div
            key={act}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: m.color,
              }}
            />
            <span style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>
              {m.label}
            </span>
            <span style={{ fontSize: 11, color: "#444" }}>— {m.desc}</span>
          </div>
        ))}
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="#333" />
          </marker>
          <marker
            id="arrow-variant"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="#2a2a3a" />
          </marker>
          {Object.entries(actMeta).map(([act, m]) => (
            <filter key={act} id={`glow-${act}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Act background bands */}
        {[
          { act: 1, y: 20, h: 220 },
          { act: 2, y: 300, h: 220 },
          { act: 3, y: 540, h: 200 },
        ].map(({ act, y, h }) => (
          <rect
            key={act}
            x={0}
            y={y}
            width={W}
            height={h}
            fill={actMeta[act].color}
            fillOpacity={0.025}
            rx={8}
            stroke={actMeta[act].color}
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}

        {/* Act labels */}
        {[
          { act: 1, y: 35 },
          { act: 2, y: 315 },
          { act: 3, y: 555 },
        ].map(({ act, y }) => (
          <text
            key={act}
            x={W - 10}
            y={y}
            textAnchor="end"
            fill={actMeta[act].color}
            fontSize={10}
            fontFamily="'IBM Plex Mono'"
            opacity={0.6}
            letterSpacing="2"
          >
            {actMeta[act].label.toUpperCase()}
          </text>
        ))}

        {/* Edges */}
        {edges.map(([a, b, isVariant]) => {
          const { x1, y1, x2, y2 } = midArrow(a, b);
          const cx = (x1 + x2) / 2;
          return (
            <path
              key={`${a}-${b}`}
              d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
              fill="none"
              stroke={isVariant ? "#2a2a3a" : "#333"}
              strokeWidth={isVariant ? 1.2 : 1.5}
              strokeDasharray={isVariant ? "5,3" : "none"}
              markerEnd={isVariant ? "url(#arrow-variant)" : "url(#arrow)"}
            />
          );
        })}

        {/* Nodes */}
        {Object.values(nodes).map((n) => {
          const color = actMeta[n.act].color;
          const isV = n.variant;
          const isH = hovered === n.id;
          return (
            <g
              key={n.id}
              className={`node ${isV ? "variant-node" : ""}`}
              transform={`translate(${n.x},${n.y})`}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                width={isV ? 130 : 140}
                height={36}
                rx={6}
                fill={isH ? "#1a1a2e" : "#11111a"}
                stroke={color}
                strokeWidth={isV ? 1 : 1.5}
                strokeDasharray={isV ? "5,3" : "none"}
                strokeOpacity={isV ? 0.5 : 0.9}
                filter={isH ? `url(#glow-${n.act})` : "none"}
              />
              <text
                x={isV ? 65 : 70}
                y={22}
                textAnchor="middle"
                fill={isV ? "#666" : "#ccc"}
                fontSize={isV ? 9.5 : 10.5}
                fontFamily="'IBM Plex Mono'"
                fontWeight={isH ? "600" : "400"}
              >
                {n.label}
              </text>
              {isV && (
                <text
                  x={isV ? 65 : 70}
                  y={-6}
                  textAnchor="middle"
                  fill={color}
                  fontSize={8}
                  fontFamily="'IBM Plex Mono'"
                  opacity={0.6}
                >
                  VARIANT
                </text>
              )}
            </g>
          );
        })}

        {/* "?" markers at decision points */}
        {[
          { x: 560, y: 108 },
          { x: 590, y: 388 },
        ].map((pos, i) => (
          <g key={i} transform={`translate(${pos.x},${pos.y})`}>
            <circle r={12} fill="#0A0A0F" stroke="#333" strokeWidth={1} />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fill="#555"
              fontSize={14}
              fontWeight="bold"
            >
              ?
            </text>
          </g>
        ))}
      </svg>

      {/* Bottom note */}
      <div
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "#333",
          borderTop: "1px solid #1a1a1a",
          paddingTop: 12,
        }}
      >
        TWO UNRESOLVED TRANSITIONS · Post-first-capture destination · Post-save
        destination
      </div>
    </div>
  );
}
