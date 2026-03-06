import { useState } from "react";

type Status = "up" | "down" | "warning" | "empty";

interface DayCell {
  status: Status;
  uptime?: number;
  day?: number;
}

interface MonthData {
  name: string;
  cells: DayCell[];
}

const STATUS_COLORS: Record<Status, string> = {
  up: "#4CAF50",
  down: "#F44336",
  warning: "#FF9800",
  empty: "#2A2A2A",
};

const STATUS_LABELS: Record<Status, string> = {
  up: "OPERATIONAL",
  down: "OUTAGE",
  warning: "DEGRADED",
  empty: "NO DATA",
};

function generateMonthData(monthName: string, daysInMonth: number, offset: number): MonthData {
  const cells: DayCell[] = [];

  for (let i = 0; i < 35; i++) {
    const dayNum = i - offset + 1;
    if (i < offset || dayNum > daysInMonth) {
      cells.push({ status: "empty" });
    } else {
      const rand = Math.random();
      let status: Status;
      let uptime: number;
      if (rand > 0.85) {
        status = "down";
        uptime = Math.floor(Math.random() * 40);
      } else if (rand > 0.65) {
        status = "warning";
        uptime = Math.floor(60 + Math.random() * 35);
      } else {
        status = "up";
        uptime = Math.floor(95 + Math.random() * 5);
      }
      cells.push({ status, uptime, day: dayNum });
    }
  }
  return { name: monthName, cells };
}

const MONTHS_DATA: MonthData[] = [
  generateMonthData("JAN 2026", 31, 3),
  generateMonthData("FEB 2026", 28, 0),
  generateMonthData("MAR 2026", 31, 0),
];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  status: Status;
  day?: number;
  uptime?: number;
  month?: string;
}

export function HeatmapGrid() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    status: "empty",
  });

  const handleMouseEnter = (
    e: React.MouseEvent,
    cell: DayCell,
    monthName: string
  ) => {
    if (cell.status === "empty") return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      status: cell.status,
      day: cell.day,
      uptime: cell.uptime,
      month: monthName,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const [selectedCell, setSelectedCell] = useState<{
    visible: boolean;
    cell: DayCell | null;
    monthName: string;
  }>({
    visible: false,
    cell: null,
    monthName: "",
  });

  return (
    <div className="relative w-full">
      {/* Incident Details Bubble Modal */}
      {selectedCell.visible && selectedCell.cell && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() =>
            setSelectedCell({ visible: false, cell: null, monthName: "" })
          }
        >
          <div
            className="relative p-6 max-w-sm w-full bg-[#1A1A1A]"
            style={{
              border: "4px solid #FFD700",
              boxShadow: "8px 8px 0px #9D50BB",
              fontFamily: "'Press Start 2P', monospace",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-[12px] text-[#FFD700] hover:text-[#9D50BB] transition-colors"
              onClick={() =>
                setSelectedCell({ visible: false, cell: null, monthName: "" })
              }
            >
              X
            </button>
            <div className="mb-5">
              <h2 className="text-[#FFD700] text-[12px] mb-3 leading-tight">
                {selectedCell.monthName} - DAY{" "}
                {selectedCell.cell.day?.toString().padStart(2, "0")}
              </h2>
              <div
                className="inline-block px-2 py-1 text-[8px]"
                style={{
                  backgroundColor: STATUS_COLORS[selectedCell.cell.status],
                  color: "#1A1A1A",
                  border: `2px solid ${STATUS_COLORS[selectedCell.cell.status]}`,
                }}
              >
                STATUS: {STATUS_LABELS[selectedCell.cell.status]}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[#9D50BB] text-[10px]">INCIDENT LOG:</div>
              <div
                className="p-3 text-[8px] leading-loose"
                style={{
                  backgroundColor: "#000000",
                  border: "2px solid #333333",
                  color:
                    selectedCell.cell.status === "up"
                      ? STATUS_COLORS.up
                      : selectedCell.cell.status === "warning"
                      ? STATUS_COLORS.warning
                      : STATUS_COLORS.down,
                }}
              >
                {selectedCell.cell.status === "up" ? (
                  <>
                    &gt; [00:00] SYSTEM INITIALIZED<br />
                    &gt; [08:00] NOMINAL OPERATION<br />
                    &gt; [16:00] ROUTINE CHECK PASS<br />
                    &gt; [23:59] CYCLE COMPLETE
                  </>
                ) : selectedCell.cell.status === "warning" ? (
                  <>
                    &gt; [04:22] LATENCY SPIKE DETECTED<br />
                    &gt; [04:25] RE-ROUTING TRAFFIC<br />
                    &gt; [05:10] PERFORMANCE DEGRADED<br />
                    &gt; [11:45] SYSTEM STABILIZING...
                  </>
                ) : (
                  <>
                    &gt; [09:15] CRITICAL FAILURE<br />
                    &gt; [09:16] CONNECTION LOST<br />
                    &gt; [10:30] ATTEMPTING REBOOT<br />
                    &gt; [14:20] PARTIAL RECOVERY
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 text-[8px] text-[#1A1A1A] hover:bg-[#9D50BB] hover:text-white transition-colors"
                style={{ backgroundColor: "#FFD700", border: "2px solid #FFD700" }}
                onClick={() =>
                  setSelectedCell({ visible: false, cell: null, monthName: "" })
                }
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            fontFamily: "'Press Start 2P', monospace",
          }}
        >
          <div
            className="px-3 py-2 text-[8px] leading-relaxed"
            style={{
              background: "#1A1A1A",
              border: `2px solid ${STATUS_COLORS[tooltip.status]}`,
              color: STATUS_COLORS[tooltip.status],
              boxShadow: `0 0 12px ${STATUS_COLORS[tooltip.status]}55`,
              whiteSpace: "nowrap",
            }}
          >
            <div>{tooltip.month}</div>
            <div>DAY {tooltip.day?.toString().padStart(2, "0")}</div>
            <div>{STATUS_LABELS[tooltip.status]}</div>
            {tooltip.uptime !== undefined && (
              <div>UPTIME: {tooltip.uptime}%</div>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex gap-4 justify-center">
        {MONTHS_DATA.map((month) => (
          <div key={month.name} className="flex flex-col gap-3 flex-1 min-w-0">
            {/* Month Label */}
            <div
              className="text-center text-[7px] py-1 px-2"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                color: "#FFD700",
                border: "1px solid #FFD700",
                background: "#FFD70011",
                letterSpacing: "0.05em",
              }}
            >
              {month.name}
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-5 gap-1">
              {["M", "T", "W", "T", "F"].map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[6px]"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    color: "#555",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Pixel Grid: 5 cols x 7 rows */}
            <div className="grid grid-cols-5 gap-1">
              {month.cells.map((cell, idx) => (
                <div
                  key={idx}
                  className="aspect-square cursor-pointer"
                  style={{
                    background:
                      cell.status === "empty"
                        ? "#2A2A2A"
                        : STATUS_COLORS[cell.status],
                    border:
                      cell.status === "empty"
                        ? "1px solid #333"
                        : `1px solid ${STATUS_COLORS[cell.status]}`,
                    boxShadow:
                      cell.status !== "empty"
                        ? `0 0 6px ${STATUS_COLORS[cell.status]}88`
                        : "none",
                    imageRendering: "pixelated",
                    transition: "transform 0.05s",
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, cell, month.name)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    if (cell.status !== "empty") {
                      setSelectedCell({
                        visible: true,
                        cell,
                        monthName: month.name,
                      });
                    }
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(0.85)";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  }}
                />
              ))}
            </div>

            {/* Month uptime summary */}
            <div
              className="text-center text-[6px] py-1"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                color: "#9D50BB",
              }}
            >
              {Math.floor(
                (month.cells.filter((c) => c.status === "up").length /
                  month.cells.filter((c) => c.status !== "empty").length) *
                  100
              )}
              % UP
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {(["up", "down", "warning"] as Status[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-3 h-3"
              style={{
                background: STATUS_COLORS[s],
                border: `1px solid ${STATUS_COLORS[s]}`,
                boxShadow: `0 0 6px ${STATUS_COLORS[s]}99`,
              }}
            />
            <span
              className="text-[6px]"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                color: STATUS_COLORS[s],
              }}
            >
              {STATUS_LABELS[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
