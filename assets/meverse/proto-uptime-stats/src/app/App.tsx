import "../styles/fonts.css";
import { HeatmapGrid } from "./components/HeatmapGrid";
import { BottomNav } from "./components/BottomNav";
import { StatusBreakdown } from "./components/StatusBreakdown";

const PIXEL_FONT = "'Press Start 2P', monospace";

function StatusBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-3 py-2"
      style={{
        border: `1px solid ${color}`,
        background: `${color}11`,
      }}
    >
      <span className="text-[5px]" style={{ fontFamily: PIXEL_FONT, color: "#888" }}>
        {label}
      </span>
      <span className="text-[9px]" style={{ fontFamily: PIXEL_FONT, color }}>
        {value}
      </span>
    </div>
  );
}

function ScanlineOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
      }}
    />
  );
}

function GlitchTitle() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glitch shadow layers */}
      <h1
        className="absolute text-[10px] sm:text-[13px] text-center select-none"
        style={{
          fontFamily: PIXEL_FONT,
          color: "#9D50BB",
          transform: "translate(-2px, 0px)",
          opacity: 0.6,
          letterSpacing: "0.08em",
          whiteSpace: "nowrap",
        }}
      >
        UPTIME VISUALIZATION
      </h1>
      <h1
        className="absolute text-[10px] sm:text-[13px] text-center select-none"
        style={{
          fontFamily: PIXEL_FONT,
          color: "#F44336",
          transform: "translate(2px, 0px)",
          opacity: 0.4,
          letterSpacing: "0.08em",
          whiteSpace: "nowrap",
        }}
      >
        UPTIME VISUALIZATION
      </h1>
      <h1
        className="relative text-[10px] sm:text-[13px] text-center"
        style={{
          fontFamily: PIXEL_FONT,
          color: "#FFD700",
          letterSpacing: "0.08em",
          textShadow: "0 0 20px #FFD70099, 0 0 40px #FFD70033",
          whiteSpace: "nowrap",
        }}
      >
        UPTIME VISUALIZATION
      </h1>
    </div>
  );
}

export default function App() {
  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#0D0D0D" }}
    >
      {/* Device frame */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(420px, 100vw)",
          height: "min(760px, 100vh)",
          background: "#1A1A1A",
          border: "2px solid #FFD700",
          boxShadow: "0 0 40px #FFD70033, 0 0 80px #9D50BB22, inset 0 0 60px #00000055",
        }}
      >
        <ScanlineOverlay />

        {/* Header */}
        <div
          className="relative z-20 flex flex-col gap-3 px-4 pt-4 pb-3"
          style={{ borderBottom: "1px solid #333" }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div
              className="text-[6px] px-2 py-1"
              style={{
                fontFamily: PIXEL_FONT,
                color: "#9D50BB",
                border: "1px solid #9D50BB",
                background: "#9D50BB11",
              }}
            >
              MEVERSE
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 animate-pulse"
                style={{ background: "#4CAF50", boxShadow: "0 0 8px #4CAF50" }}
              />
              <span
                className="text-[6px]"
                style={{ fontFamily: PIXEL_FONT, color: "#4CAF50" }}
              >
                LIVE
              </span>
            </div>
            <div
              className="text-[6px] px-2 py-1"
              style={{
                fontFamily: PIXEL_FONT,
                color: "#555",
                border: "1px solid #333",
              }}
            >v0.3.1</div>
          </div>

          {/* Title */}
          <GlitchTitle />

          {/* Decorative line */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: "#FFD700" }} />
            <button 
              className="w-3 h-3 cursor-pointer hover:scale-110 transition-transform" 
              style={{ background: "#FFD700", border: "1px solid #FFD700" }} 
              title="Heatmap View"
            />
            <button 
              className="w-3 h-3 cursor-pointer hover:scale-110 transition-transform" 
              style={{ background: "transparent", border: "1px solid #FFDB58" }} 
              title="Incidents List View"
            />
            <div className="flex-1 h-px" style={{ background: "#FFD700" }} />
          </div>
        </div>

        {/* Status badges */}
        <div
          className="relative z-20 flex gap-2 px-4 py-3"
          style={{ borderBottom: "1px solid #222" }}
        >
          <StatusBadge label="UPTIME" value="98.3%" color="#4CAF50" />
          <StatusBadge label="INCIDENTS" value="007" color="#F44336" />
          <StatusBadge label="WARNINGS" value="024" color="#FF9800" />
          <StatusBadge label="SLA" value="99.5%" color="#9D50BB" />
        </div>

        {/* Section label */}
        <div
          className="relative z-20 flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: "1px solid #222" }}
        >
          <div className="w-1 h-4" style={{ background: "#9D50BB" }} />
          <span
            className="text-[7px]"
            style={{ fontFamily: PIXEL_FONT, color: "#9D50BB" }}
          >
            QUARTERLY HEATMAP
          </span>
          <div className="flex-1 h-px" style={{ background: "#222" }} />
          <span
            className="text-[6px]"
            style={{ fontFamily: PIXEL_FONT, color: "#444" }}
          >
            Q1 2026
          </span>
        </div>

        {/* Heatmap */}
        <div className="relative z-20 flex-1 overflow-y-auto px-4 py-4">
          <HeatmapGrid />

          {/* Extra stats */}
          <StatusBreakdown />
        </div>

        {/* Bottom Nav */}
        <div className="relative z-20">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}