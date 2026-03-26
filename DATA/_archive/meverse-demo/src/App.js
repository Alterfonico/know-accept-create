import { useState, useRef, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════
   meverse-react v0.30.0

   Rebuilt from meverse-reader_v050 (visual language)
   + meverse-act-ii_v0_21_0 (capture-echo wiring).

   Light mode · chat-style layout · left voltage stripe
   ══════════════════════════════════════════════════════ */

/* ── DESIGN TOKENS (light mode) ────────────────────── */
const T = {
  bg: "#F7F5F2",
  bg2: "#EDEAE5",
  bg3: "#E4E0DA",
  life: "#3DAB7A",
  upset: "#C0504A",
  poke: "#C87D2F",
  purple: "#7C5CBF",
  text: "#2A2826",
  dim: "#9E9891",
  dim2: "#C8C3BB",
  border: "rgba(0,0,0,0.06)",
  mono: "'IBM Plex Mono', monospace",
  disp: "'Syne', sans-serif",
};

/* ── VOLTAGE ───────────────────────────────────────── */
const VOLTAGE = [
  { key: "life", int: 1, label: "LIFE", full: "HI · LIFE", color: T.life },
  { key: "upset", int: 2, label: "UPSET", full: "LO · UPSET", color: T.upset },
  { key: "poke", int: 0, label: "POKE", full: "FLAT · POKE", color: T.poke },
];
const V_NONE = { key: "none", int: null, label: "", full: "", color: T.dim2 };
const VOLTAGE_MAP = { HI: VOLTAGE[0], LO: VOLTAGE[1], FLAT: VOLTAGE[2] };

/* ── API ───────────────────────────────────────────── */
const CAPTURE_ECHO_URL =
  "https://nlfryozynimffhwkhhls.supabase.co/functions/v1/capture-echo";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZnJ5b3p5bmltZmZod2toaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTExMDAsImV4cCI6MjA4ODEyNzEwMH0.VWLopIlZi7ad6MNA84LEo7ztiWBylzJ6g5Y1jHav1zw";

async function classifyEcho(text) {
  const res = await fetch(CAPTURE_ECHO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ text, source: "app" }),
  });
  if (!res.ok) throw new Error(`capture-echo ${res.status}`);
  return res.json(); // { id, voltage, confidence, analysis }
}

/* ── HELPERS ────────────────────────────────────────── */
function isoNow() {
  return new Date().toISOString();
}

function timeFmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  if (+day === +today) return "today";
  if (+day === +yest) return "yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function fullTs(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* ── SEED DATA ─────────────────────────────────────── */
const NOW = Date.now();
const DAY = 86400000;
const HR = 3600000;

const SEED = [
  {
    id: "e1",
    text: "tired in a way that sleep doesn't fix",
    created_at: new Date(NOW - DAY * 3 + HR * 23).toISOString(),
    voltage: VOLTAGE[1],
    confidence: 0.89,
    analysis:
      "Structural fatigue. Not rest deficit — meaning deficit. The two look identical from inside.",
    device: "mobile",
    source: "app",
    isOrigin: false,
    children: [],
  },
  {
    id: "e2",
    text: "talked to someone who actually listened. forgot that was possible.",
    created_at: new Date(NOW - DAY * 2 + HR * 18).toISOString(),
    voltage: VOLTAGE[0],
    confidence: 0.94,
    analysis:
      'The surprise in "forgot that was possible" is the signal. The baseline shifted somewhere, and you just noticed the distance.',
    device: "mobile",
    source: "app",
    isOrigin: false,
    children: [],
  },
  {
    id: "e3",
    text: "here",
    created_at: new Date(NOW - DAY + HR * 7.5).toISOString(),
    voltage: VOLTAGE[2],
    confidence: 0.62,
    analysis:
      "Presence without content. That's contact. The system registered you were here.",
    device: "mobile",
    source: "android",
    isOrigin: false,
    children: [],
  },
  {
    id: "e4",
    text: "I keep cancelling things I actually want to do",
    created_at: new Date(NOW - DAY + HR * 22).toISOString(),
    voltage: VOLTAGE[1],
    confidence: 0.91,
    analysis:
      "The erosion is in the gap between wanting and doing. That gap has a shape. This is the third time it has appeared this week.",
    device: "mobile",
    source: "app",
    isOrigin: false,
    children: [],
  },
  {
    id: "e5",
    text: "something is shifting and I can't quite name it yet",
    created_at: new Date(NOW - HR * 2).toISOString(),
    voltage: VOLTAGE[0],
    confidence: 0.87,
    analysis:
      "Something unnamed is in motion. The fact that you can feel it without labeling it is its own signal.",
    device: "computer",
    source: "app",
    isOrigin: true,
    children: [],
  },
];

/* ── CSS ───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,600;1,300&family=Syne:wght@700;800&display=swap');

@keyframes breathe {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.2); }
}
@keyframes echoIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes expandFade {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes panelSlide {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes panelOut {
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
}
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes flicker {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 1; }
}

.filter-scroll::-webkit-scrollbar { display: none; }
.filter-scroll { scrollbar-width: none; }
`;

/* ── FILTER CHIP CONFIG ────────────────────────────── */
const FILTERS = [
  { key: "all", label: "all", ac: T.text },
  { key: "life", label: "● life", ac: T.life },
  { key: "upset", label: "● upset", ac: T.upset },
  { key: "poke", label: "● poke", ac: T.poke },
  { key: "null", label: "● raw", ac: T.dim },
  { key: "mobile", label: "mobile", ac: T.purple },
  { key: "computer", label: "computer", ac: T.purple },
];

/* ── COMPONENTS ────────────────────────────────────── */

function EchoBubble({ echo, expanded, onTap, onAsk, isNew, isNewGroup }) {
  const v = echo.voltage || V_NONE;
  const time = timeFmt(echo.created_at);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "0 2px",
        marginTop: isNewGroup ? 10 : 2,
        animation: isNew ? "echoIn 0.3s ease forwards" : "none",
      }}
    >
      <div
        onClick={() => onTap(echo.id)}
        style={{
          maxWidth: "82%",
          background: T.bg2,
          borderRadius: "16px 16px 3px 16px",
          padding: "10px 14px 8px",
          border: `1px solid ${T.border}`,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          fontFamily: T.mono,
          transition: "border-color 0.15s",
        }}
      >
        {/* left voltage stripe */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            background: v.color,
            boxShadow: v.key !== "none" ? `2px 0 6px ${v.color}33` : "none",
          }}
        />

        {/* origin marker */}
        {echo.isOrigin && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              fontSize: 8,
              opacity: 0.3,
              color: v.color,
            }}
          >
            ◆
          </span>
        )}

        {/* text */}
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: T.text,
            paddingLeft: 6,
            wordBreak: "break-word",
            ...(!expanded
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : {}),
          }}
        >
          {echo.text}
        </div>

        {/* footer: time + voltage + device */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 5,
            paddingLeft: 6,
          }}
        >
          <span style={{ fontSize: 9, letterSpacing: 1, color: T.dim }}>
            {time}
          </span>
          {v.label && (
            <span style={{ fontSize: 9, letterSpacing: 0.5, color: v.color }}>
              {v.label}
            </span>
          )}
          {echo.device && (
            <span
              style={{
                fontSize: 8,
                color: T.dim,
                opacity: 0.45,
                marginLeft: "auto",
              }}
            >
              {echo.device}
            </span>
          )}
        </div>

        {/* ── inline expansion ── */}
        {expanded && (
          <div
            style={{
              borderTop: `1px solid ${T.border}`,
              marginTop: 8,
              paddingTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              animation: "expandFade 0.2s ease forwards",
            }}
          >
            {/* metadata rows */}
            {[
              ["time", fullTs(echo.created_at), null],
              ["state", v.full || "—", v.color],
              [
                "confidence",
                echo.confidence != null ? echo.confidence.toFixed(2) : "—",
                null,
              ],
              ["source", echo.source || "—", null],
              ["device", echo.device || "—", null],
            ].map(([key, val, color]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    letterSpacing: 1.5,
                    color: T.dim,
                    textTransform: "uppercase",
                  }}
                >
                  {key}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: color || T.text,
                    opacity: color ? 1 : 0.55,
                    textAlign: "right",
                  }}
                >
                  {val}
                </span>
              </div>
            ))}

            {/* analysis preview */}
            {echo.analysis && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  color: "rgba(0,0,0,0.4)",
                  paddingLeft: 8,
                  borderLeft: `2px solid ${
                    v.key === "life"
                      ? "rgba(61,171,122,0.2)"
                      : v.key === "upset"
                        ? "rgba(192,80,74,0.2)"
                        : "rgba(0,0,0,0.08)"
                  }`,
                }}
              >
                {echo.analysis}
              </div>
            )}

            {/* ask link → opens detail panel */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAsk(echo);
              }}
              style={{
                alignSelf: "flex-end",
                background: "none",
                border: "none",
                fontFamily: T.mono,
                fontSize: 9,
                letterSpacing: 1,
                color: T.purple,
                cursor: "pointer",
                padding: "4px 0",
                marginTop: 2,
              }}
            >
              ask about this ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailPanel({ echo, onClose, onInquiry, closing }) {
  const [inquiry, setInquiry] = useState("");
  const taRef = useRef(null);

  useEffect(() => {
    setInquiry("");
    if (taRef.current) taRef.current.focus();
  }, [echo?.id]);

  if (!echo) return null;

  const v = echo.voltage || V_NONE;

  function handleSend() {
    const q = inquiry.trim();
    if (!q) return;
    onInquiry(echo.id, q);
    setInquiry("");
  }

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 59,
          background: "rgba(0,0,0,0.1)",
          animation: closing
            ? "fadeOut 0.25s ease forwards"
            : "fadeIn 0.2s ease forwards",
        }}
      />

      {/* panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "84%",
          background: T.bg,
          zIndex: 60,
          borderLeft: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: T.mono,
          animation: closing
            ? "panelOut 0.25s cubic-bezier(.16,1,.3,1) forwards"
            : "panelSlide 0.3s cubic-bezier(.16,1,.3,1) forwards",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "48px 18px 12px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 9, letterSpacing: 2, color: T.dim }}>
            {echo.isOrigin ? "◆ origin echo" : "echo detail"}
          </span>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              fontSize: 14,
              color: T.dim,
              cursor: "pointer",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              background: "none",
              border: "none",
              fontFamily: T.mono,
            }}
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 18px 110px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* full text */}
          <div style={{ fontSize: 15, lineHeight: 1.75, color: T.text }}>
            {echo.text}
          </div>

          {/* meta grid */}
          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
              padding: "12px 0",
              borderTop: `1px solid ${T.border}`,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {[
              { label: "voltage", val: v.full || "—", color: v.color },
              { label: "confidence", val: echo.confidence?.toFixed(2) || "—" },
              { label: "time", val: timeFmt(echo.created_at) },
              { label: "source", val: echo.source || "—" },
            ].map((m) => (
              <div
                key={m.label}
                style={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                <div style={{ fontSize: 8, letterSpacing: 2, color: T.dim }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 11, color: m.color || T.text }}>
                  {m.val}
                </div>
              </div>
            ))}
          </div>

          {/* analysis */}
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.75,
              fontStyle: "italic",
              padding: "12px 14px",
              borderRadius: 6,
              borderLeft: `2px solid ${
                v.key === "life"
                  ? "rgba(61,171,122,0.2)"
                  : v.key === "upset"
                    ? "rgba(192,80,74,0.2)"
                    : "rgba(0,0,0,0.08)"
              }`,
              background:
                v.key === "life"
                  ? "rgba(61,171,122,0.03)"
                  : v.key === "upset"
                    ? "rgba(192,80,74,0.03)"
                    : "rgba(0,0,0,0.02)",
              color: "rgba(0,0,0,0.45)",
            }}
          >
            {echo.analysis || "classifying..."}
          </div>

          {/* child inquiries */}
          {echo.children.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                background: "rgba(124,92,191,0.04)",
                border: "1px solid rgba(124,92,191,0.1)",
                borderRadius: 8,
                animation: "echoIn 0.3s ease forwards",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  letterSpacing: 2,
                  color: T.purple,
                  marginBottom: 4,
                }}
              >
                inquiry
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: T.text }}>
                {c.text}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: T.dim,
                  fontStyle: "italic",
                }}
              >
                processing...
              </div>
            </div>
          ))}
        </div>

        {/* inquiry input */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 14px 28px",
            background: `linear-gradient(transparent, ${T.bg} 32%)`,
          }}
        >
          <div
            style={{
              background: T.bg2,
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 50,
              padding: "0 6px 0 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <textarea
              ref={taRef}
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                echo.isOrigin
                  ? "what's the thing you keep almost saying?"
                  : "ask about this moment..."
              }
              rows={1}
              style={{
                display: "block",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: T.mono,
                fontSize: 12,
                color: T.text,
                resize: "none",
                width: "100%",
                lineHeight: 1.6,
                minHeight: 40,
                maxHeight: 40,
                padding: "10px 0",
                overflow: "hidden",
              }}
            />
            <button
              onClick={handleSend}
              aria-label="Send inquiry"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: inquiry.trim() ? T.purple : T.dim2,
                border: "none",
                cursor: inquiry.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#F7F5F2",
                fontSize: 12,
                transition: "background 0.15s",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── MAIN ──────────────────────────────────────────── */

export default function MeverseReact() {
  const [echoes, setEchoes] = useState(SEED);
  const [draft, setDraft] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [panelId, setPanelId] = useState(null);
  const [closing, setClosing] = useState(false);
  const [newIds, setNewIds] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const counter = useRef(SEED.length);

  const panelEcho = echoes.find((e) => e.id === panelId) || null;

  const scrollBottom = useCallback(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, []);
  useEffect(scrollBottom, [echoes.length, scrollBottom]);

  /* ── filter ── */
  const filtered = echoes.filter((e) => {
    if (filter === "all") return true;
    if (filter === "life") return e.voltage?.key === "life";
    if (filter === "upset") return e.voltage?.key === "upset";
    if (filter === "poke") return e.voltage?.key === "poke";
    if (filter === "null") return !e.voltage || e.voltage.key === "none";
    if (filter === "mobile") return e.device === "mobile";
    if (filter === "computer") return e.device === "computer";
    return true;
  });

  /* ── date grouping ── */
  const ordered = [...filtered].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  );

  const renderItems = [];
  let lastDL = null;
  let lastMin = null;

  ordered.forEach((echo) => {
    const dl = dateLabel(echo.created_at);
    if (dl !== lastDL) {
      renderItems.push({ type: "sep", label: dl, key: "sep-" + dl });
      lastDL = dl;
      lastMin = null;
    }
    const thisM = echo.created_at
      ? Math.floor(new Date(echo.created_at).getTime() / 60000)
      : 0;
    const isNewGroup = lastMin === null || thisM - lastMin > 5;
    lastMin = thisM;
    renderItems.push({ type: "echo", echo, isNewGroup, key: echo.id });
  });

  const echoCount = filtered.length;

  /* ── send ── */
  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    counter.current++;
    const id = "e" + counter.current;

    const newEcho = {
      id,
      text,
      created_at: isoNow(),
      voltage: VOLTAGE[2], // FLAT placeholder
      confidence: null,
      analysis: "classifying...",
      device: "computer",
      source: "app",
      isOrigin: false,
      children: [],
    };

    setEchoes((prev) => [...prev, newEcho]);
    setDraft("");
    setNewIds((prev) => new Set(prev).add(id));
    setTimeout(
      () =>
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        }),
      800,
    );

    // post-capture placeholder flash
    if (inputRef.current) {
      inputRef.current.placeholder = "breathe, captured.";
      setTimeout(() => {
        if (inputRef.current)
          inputRef.current.placeholder = "what's here right now...";
      }, 2000);
    }

    try {
      const result = await classifyEcho(text);
      setEchoes((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                voltage: VOLTAGE_MAP[result.voltage] ?? VOLTAGE[2],
                confidence: result.confidence,
                analysis: result.analysis,
              }
            : e,
        ),
      );
    } catch (_err) {
      // Failure contract: echo is never lost — stays with FLAT, no analysis
      setEchoes((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, analysis: "signal received." } : e,
        ),
      );
    }
  }

  /* ── interactions ── */
  function handleBubbleTap(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleOpenPanel(echo) {
    setClosing(false);
    setPanelId(echo.id);
  }

  function handleClosePanel() {
    setClosing(true);
    setTimeout(() => {
      setPanelId(null);
      setClosing(false);
    }, 250);
  }

  function handleInquiry(echoId, text) {
    setEchoes((prev) =>
      prev.map((e) =>
        e.id === echoId
          ? { ...e, children: [...e.children, { text, ts: timeFmt(isoNow()) }] }
          : e,
      ),
    );
  }

  /* ── render ── */
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#E8E4DE",
        fontFamily: T.mono,
      }}
    >
      <style>{CSS}</style>

      {/* ── phone frame ── */}
      <div
        style={{
          width: 375,
          height: 812,
          background: T.bg,
          borderRadius: 48,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          border: "1.5px solid rgba(0,0,0,0.08)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.03), 0 0 60px rgba(0,0,0,0.06), 0 40px 80px rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 28,
            background: "#E8E4DE",
            borderRadius: "0 0 18px 18px",
            zIndex: 999,
          }}
        />

        {/* status bar */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 24,
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            letterSpacing: 1,
            fontFamily: T.mono,
          }}
        >
          9:41
        </div>

        {/* ── top nav ── */}
        <div
          style={{
            flexShrink: 0,
            borderBottom: `1px solid ${T.border}`,
            padding: "42px 16px 10px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: T.bg3,
              border: "1px solid rgba(61,171,122,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: T.life,
                animation: "breathe 2.8s ease-in-out infinite",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: T.disp,
                fontSize: 14,
                fontWeight: 800,
                color: T.text,
                letterSpacing: 3,
                lineHeight: 1.2,
              }}
            >
              ECHO CHAMBER
            </div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.5,
                color: T.dim,
                marginTop: 1,
              }}
            >
              {echoCount} echo{echoCount !== 1 ? "es" : ""} · open brain
            </div>
          </div>

          <button
            onClick={() => setFilterOpen((p) => !p)}
            aria-label="Toggle filters"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: filterOpen ? T.text : T.dim,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ⊹
          </button>
        </div>

        {/* ── filter bar ── */}
        <div
          style={{
            flexShrink: 0,
            overflow: "hidden",
            maxHeight: filterOpen ? 48 : 0,
            transition: "max-height 0.3s cubic-bezier(0.16,1,0.3,1)",
            borderBottom: filterOpen
              ? `1px solid ${T.border}`
              : "1px solid transparent",
          }}
        >
          <div
            className="filter-scroll"
            style={{
              display: "flex",
              gap: 6,
              padding: "9px 16px",
              overflowX: "auto",
            }}
          >
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    flexShrink: 0,
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: `1px solid ${active ? f.ac + "66" : T.border}`,
                    background: active ? f.ac + "0A" : "transparent",
                    color: active ? f.ac : T.dim,
                    fontFamily: T.mono,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── chat area ── */}
        <div
          ref={chatRef}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "12px 14px 120px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* empty state */}
          {renderItems.length === 0 && (
            <div
              style={{
                alignSelf: "center",
                margin: "auto",
                fontSize: 10,
                letterSpacing: 2.5,
                color: T.dim,
                animation: "flicker 1.6s ease-in-out infinite",
              }}
            >
              no echoes yet ···
            </div>
          )}

          {renderItems.map((item) => {
            if (item.type === "sep") {
              return (
                <div
                  key={item.key}
                  style={{
                    alignSelf: "center",
                    fontSize: 9,
                    letterSpacing: 1.8,
                    color: T.dim,
                    background: T.bg2,
                    border: `1px solid ${T.border}`,
                    borderRadius: 20,
                    padding: "3px 10px",
                    margin: "10px 0 4px",
                    textTransform: "lowercase",
                  }}
                >
                  {item.label}
                </div>
              );
            }

            return (
              <EchoBubble
                key={item.key}
                echo={item.echo}
                expanded={expandedId === item.echo.id}
                onTap={handleBubbleTap}
                onAsk={handleOpenPanel}
                isNew={newIds.has(item.echo.id)}
                isNewGroup={item.isNewGroup}
              />
            );
          })}
        </div>

        {/* ── input bar ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 14px 28px",
            background: `linear-gradient(transparent, ${T.bg} 32%)`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: T.bg2,
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 50,
              padding: "0 6px 0 18px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="what's here right now..."
              rows={1}
              style={{
                display: "block",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: T.mono,
                fontSize: 13,
                color: T.text,
                resize: "none",
                width: "100%",
                lineHeight: 1.6,
                minHeight: 44,
                maxHeight: 44,
                padding: "12px 0",
                overflow: "hidden",
              }}
            />
            <button
              onClick={handleSend}
              aria-label="Send echo"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: draft.trim() ? T.life : T.dim2,
                border: "none",
                cursor: draft.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#F7F5F2",
                fontSize: 14,
                transition: "background 0.15s, transform 0.1s",
              }}
            >
              ↑
            </button>
          </div>
        </div>

        {/* detail panel */}
        {panelId && (
          <DetailPanel
            echo={panelEcho}
            onClose={handleClosePanel}
            onInquiry={handleInquiry}
            closing={closing}
          />
        )}

        {/* version strip */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 4,
            textAlign: "center",
            fontSize: 7,
            letterSpacing: 1.5,
            color: "rgba(0,0,0,0.12)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          v0.30.0 · echo chamber · capture-echo wired
        </div>
      </div>
    </div>
  );
}
