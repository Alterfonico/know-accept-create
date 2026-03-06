import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const GraphIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="4" height="4" fill="currentColor" opacity="1" />
    <rect x="5" y="0" width="4" height="4" fill="currentColor" opacity="0.4" />
    <rect x="10" y="0" width="4" height="4" fill="currentColor" opacity="0.7" />
    <rect x="15" y="0" width="4" height="4" fill="currentColor" opacity="0.3" />
    <rect x="0" y="5" width="4" height="4" fill="currentColor" opacity="0.5" />
    <rect x="5" y="5" width="4" height="4" fill="currentColor" opacity="1" />
    <rect x="10" y="5" width="4" height="4" fill="currentColor" opacity="0.3" />
    <rect x="15" y="5" width="4" height="4" fill="currentColor" opacity="0.8" />
    <rect x="0" y="10" width="4" height="4" fill="currentColor" opacity="0.2" />
    <rect x="5" y="10" width="4" height="4" fill="currentColor" opacity="0.6" />
    <rect x="10" y="10" width="4" height="4" fill="currentColor" opacity="1" />
    <rect x="15" y="10" width="4" height="4" fill="currentColor" opacity="0.5" />
    <rect x="0" y="15" width="4" height="4" fill="currentColor" opacity="0.7" />
    <rect x="5" y="15" width="4" height="4" fill="currentColor" opacity="0.2" />
    <rect x="10" y="15" width="4" height="4" fill="currentColor" opacity="0.5" />
    <rect x="15" y="15" width="4" height="4" fill="currentColor" opacity="1" />
  </svg>
);

const FoldersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Center node */}
    <rect x="8" y="8" width="4" height="4" fill="currentColor" />
    {/* Connector lines */}
    <rect x="3" y="9" width="5" height="2" fill="currentColor" opacity="0.7" />
    <rect x="12" y="9" width="5" height="2" fill="currentColor" opacity="0.7" />
    <rect x="9" y="3" width="2" height="5" fill="currentColor" opacity="0.7" />
    <rect x="9" y="12" width="2" height="5" fill="currentColor" opacity="0.7" />
    {/* Diagonal connectors */}
    <rect x="4" y="4" width="2" height="2" fill="currentColor" opacity="0.4" />
    <rect x="5" y="5" width="2" height="2" fill="currentColor" opacity="0.4" />
    <rect x="6" y="6" width="2" height="2" fill="currentColor" opacity="0.4" />
    <rect x="13" y="13" width="2" height="2" fill="currentColor" opacity="0.4" />
    <rect x="12" y="12" width="2" height="2" fill="currentColor" opacity="0.4" />
    {/* Outer nodes */}
    <rect x="0" y="8" width="3" height="4" fill="currentColor" />
    <rect x="17" y="8" width="3" height="4" fill="currentColor" />
    <rect x="8" y="0" width="4" height="3" fill="currentColor" />
    <rect x="8" y="17" width="4" height="3" fill="currentColor" />
    <rect x="1" y="1" width="3" height="3" fill="currentColor" opacity="0.6" />
    <rect x="16" y="16" width="3" height="3" fill="currentColor" opacity="0.6" />
  </svg>
);

const HierarchyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="0" width="4" height="4" fill="currentColor" />
    <rect x="9" y="4" width="2" height="4" fill="currentColor" />
    <rect x="2" y="8" width="6" height="2" fill="currentColor" />
    <rect x="12" y="8" width="6" height="2" fill="currentColor" />
    <rect x="1" y="10" width="4" height="4" fill="currentColor" />
    <rect x="15" y="10" width="4" height="4" fill="currentColor" />
    <rect x="7" y="8" width="6" height="2" fill="currentColor" />
    <rect x="8" y="10" width="4" height="4" fill="currentColor" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { id: "graph", label: "HEATMAP", icon: <GraphIcon /> },
  { id: "folders", label: "NETWORK", icon: <FoldersIcon /> },
  { id: "hierarchy", label: "HIERARCHY", icon: <HierarchyIcon /> },
];

export function BottomNav() {
  const [active, setActive] = useState("graph");

  return (
    <div
      className="w-full flex"
      style={{
        background: "#111",
        borderTop: "2px solid #FFD700",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-2 py-3 cursor-pointer relative"
            style={{
              background: isActive ? "#FFD70011" : "transparent",
              border: "none",
              outline: "none",
              borderRight: item.id !== "hierarchy" ? "1px solid #333" : "none",
            }}
          >
            {isActive && (
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "#FFD700" }}
              />
            )}
            <div
              style={{
                color: isActive ? "#FFD700" : "#555",
                filter: isActive ? "drop-shadow(0 0 6px #FFD700)" : "none",
                transition: "color 0.1s, filter 0.1s",
              }}
            >
              {item.icon}
            </div>
            <span
              className="text-[6px]"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                color: isActive ? "#FFD700" : "#555",
                letterSpacing: "0.05em",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}