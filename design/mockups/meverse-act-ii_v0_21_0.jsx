import { useState, useRef, useEffect, useCallback } from "react";

/* ── DESIGN TOKENS ─────────────────────────────────── */
const T = {
  bg:     "#F7F5F2",
  bg2:    "#EDEAE5",
  bg3:    "#E4E0DA",
  life:   "#3DAB7A",
  upset:  "#C0504A",
  poke:   "#C87D2F",
  purple: "#7C5CBF",
  text:   "#2A2826",
  dim:    "#9E9891",
  muted:  "#D8D4CE",
  mono:   "'IBM Plex Mono', monospace",
  disp:   "'Syne', sans-serif",
};

const VOLTAGE = [
  { key: "life",  label: "HI · 1 · LIFE",  color: T.life  },
  { key: "upset", label: "LO · 2 · UPSET",  color: T.upset },
  { key: "poke",  label: "FLAT · 0 · POKE", color: T.poke  },
];

const VOLTAGE_MAP = { HI: VOLTAGE[0], LO: VOLTAGE[1], FLAT: VOLTAGE[2] };

const CAPTURE_ECHO_URL = "https://nlfryozynimffhwkhhls.supabase.co/functions/v1/capture-echo";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZnJ5b3p5bmltZmZod2toaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTExMDAsImV4cCI6MjA4ODEyNzEwMH0.VWLopIlZi7ad6MNA84LEo7ztiWBylzJ6g5Y1jHav1zw";

async function classifyEcho(text) {
  const res = await fetch(CAPTURE_ECHO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ text, source: "app" }),
  });
  if (!res.ok) throw new Error(`capture-echo ${res.status}`);
  return res.json(); // { id, voltage, confidence, analysis }
}

function timeNow() {
  const d = new Date();
  return "today · " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

/* ── SEED DATA ─────────────────────────────────────── */
const SEED = [
  { id: "e5", text: "tired in a way that sleep doesn't fix", ts: "Sun · 23:11", voltage: VOLTAGE[1], confidence: 0.89, analysis: "Structural fatigue. Not rest deficit — meaning deficit. The two look identical from inside.", isOrigin: false, children: [] },
  { id: "e4", text: "talked to someone who actually listened. forgot that was possible.", ts: "Mon · 18:44", voltage: VOLTAGE[0], confidence: 0.94, analysis: "The surprise in \"forgot that was possible\" is the signal. The baseline shifted somewhere, and you just noticed the distance.", isOrigin: false, children: [] },
  { id: "e3", text: "here", ts: "yesterday · 07:30", voltage: VOLTAGE[2], confidence: 0.62, analysis: "Presence without content. That's contact. The system registered you were here.", isOrigin: false, children: [] },
  { id: "e2", text: "I keep cancelling things I actually want to do", ts: "yesterday · 22:03", voltage: VOLTAGE[1], confidence: 0.91, analysis: "The erosion is in the gap between wanting and doing. That gap has a shape. This is the third time it has appeared this week.", isOrigin: false, children: [] },
  { id: "e1", text: "something is shifting and I can't quite name it yet", ts: "today · 09:14", voltage: VOLTAGE[0], confidence: 0.87, analysis: "Something unnamed is in motion. The fact that you can feel it without labeling it is its own signal.", isOrigin: true, children: [] },
];

/* ── STYLES (injected once) ────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,600;1,300&family=Syne:wght@700;800&display=swap');

@keyframes echoIn {
  from { opacity: 0; transform: translateY(8px); }
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
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes accentPulse {
  0%   { opacity: 1; }
  30%  { opacity: 0.2; filter: brightness(2.5); }
  60%  { opacity: 0.85; filter: brightness(1.6); }
  100% { opacity: 1; filter: none; }
}
@keyframes headerFlash {
  0%   { color: ${T.life}; }
  70%  { color: ${T.life}; }
  100% { color: ${T.dim}; }
}
`;

/* ── COMPONENTS ────────────────────────────────────── */

function AccentBar({ voltage, pulse }) {
  const grad = `linear-gradient(90deg, ${voltage.color}, transparent)`;
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      borderRadius: "12px 12px 0 0",
      background: grad,
      animation: pulse ? "accentPulse 0.7s ease forwards" : "none",
    }} />
  );
}

function EchoBubble({ echo, onClick, isNew }) {
  return (
    <div
      onClick={() => onClick(echo)}
      style={{
        position: "relative",
        padding: "10px 14px 9px",
        borderRadius: 12,
        cursor: "pointer",
        background: T.bg2,
        border: "1px solid rgba(0,0,0,0.08)",
        fontFamily: T.mono,
        transition: "border-color 0.15s",
        overflow: "hidden",
        animation: isNew ? "echoIn 0.3s ease forwards" : "none",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.04)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"}
    >
      <AccentBar voltage={echo.voltage} pulse={isNew} />

      {echo.isOrigin && (
        <span style={{
          position: "absolute", top: 10, right: 12,
          fontSize: 8, opacity: 0.3, color: echo.voltage.color,
        }}>◆</span>
      )}

      <div style={{
        fontSize: 14, lineHeight: 1.65, color: T.text,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {echo.text}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginTop: 6,
      }}>
        <span style={{ fontSize: 9, color: T.dim }}>{echo.ts}</span>
        <span style={{ fontSize: 9, color: echo.voltage.color, letterSpacing: 0.5 }}>
          {echo.voltage.label}
        </span>
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

  const words = echo.text.trim().split(/\s+/).filter(Boolean).length;

  function handleSend() {
    const q = inquiry.trim();
    if (!q) return;
    onInquiry(echo.id, q);
    setInquiry("");
  }

  const meta = [
    { label: "timestamp", val: echo.ts },
    { label: "voltage", val: echo.voltage.label, color: echo.voltage.color },
    { label: "confidence", val: echo.confidence?.toFixed(2) || "—" },
    { label: "words", val: words },
  ];
  if (echo.isOrigin) meta.push({ label: "type", val: "◆ origin", color: echo.voltage.color });

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, zIndex: 59,
          background: "rgba(0,0,0,0.12)",
          animation: closing ? "fadeOut 0.25s ease forwards" : "fadeIn 0.2s ease forwards",
        }}
      />

      {/* panel */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: "82%", background: T.bg, zIndex: 60,
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        fontFamily: T.mono,
        animation: closing
          ? "panelOut 0.25s cubic-bezier(.16,1,.3,1) forwards"
          : "panelSlide 0.32s cubic-bezier(.16,1,.3,1) forwards",
      }}>
        {/* header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "48px 18px 12px",
          borderBottom: "1px solid rgba(0,0,0,0.04)", flexShrink: 0,
        }}>
          <span style={{
            fontSize: 9, letterSpacing: 2, color: T.dim,
          }}>
            {echo.isOrigin ? "◆ origin echo" : "echo detail"}
          </span>
          <button onClick={onClose} style={{
            fontSize: 14, color: T.dim, cursor: "pointer",
            width: 28, height: 28, display: "flex",
            alignItems: "center", justifyContent: "center",
            borderRadius: 6, background: "none", border: "none",
            fontFamily: T.mono, transition: "all 0.12s",
          }}>✕</button>
        </div>

        {/* body */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "18px 18px 110px",
          display: "flex", flexDirection: "column", gap: 18,
        }}>
          <div style={{ fontSize: 15, lineHeight: 1.75, color: T.text }}>
            {echo.text}
          </div>

          {/* meta grid */}
          <div style={{
            display: "flex", gap: 20, flexWrap: "wrap",
            padding: "14px 0",
            borderTop: "1px solid rgba(0,0,0,0.04)",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
          }}>
            {meta.map(m => (
              <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 8, letterSpacing: 2, color: T.dim }}>{m.label}</div>
                <div style={{ fontSize: 11, color: m.color || T.text }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* analysis */}
          <div style={{
            fontSize: 12, lineHeight: 1.75, fontStyle: "italic",
            padding: "12px 14px", borderRadius: 6,
            borderLeft: `2px solid ${echo.voltage.key === "life" ? "rgba(61,171,122,0.2)" : echo.voltage.key === "upset" ? "rgba(192,80,74,0.2)" : "rgba(0,0,0,0.1)"}`,
            background: echo.voltage.key === "life" ? "rgba(61,171,122,0.03)" : echo.voltage.key === "upset" ? "rgba(192,80,74,0.03)" : "rgba(0,0,0,0.04)",
            color: "rgba(0,0,0,0.45)",
          }}>
            {echo.analysis || "classifying..."}
          </div>

          {/* child echoes (inquiries) */}
          {echo.children.map((c, i) => (
            <div key={i} style={{
              padding: "10px 14px",
              background: "rgba(124,92,191,0.04)",
              border: "1px solid rgba(124,92,191,0.1)",
              borderRadius: 8, animation: "echoIn 0.3s ease forwards",
            }}>
              <div style={{ fontSize: 8, letterSpacing: 2, color: T.purple, marginBottom: 4 }}>
                inquiry
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: T.text }}>{c.text}</div>
              <div style={{
                marginTop: 8, fontSize: 11, color: T.dim, fontStyle: "italic",
              }}>processing...</div>
            </div>
          ))}
        </div>

        {/* inquiry input */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 14px 28px",
          background: `linear-gradient(transparent, ${T.bg} 32%)`,
        }}>
          <div style={{
            background: T.bg2, border: "1px solid rgba(0,0,0,0.14)",
            borderRadius: 50, padding: "0 6px 0 18px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <textarea
              ref={taRef}
              value={inquiry}
              onChange={e => setInquiry(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder={echo.isOrigin
                ? "what's the thing you keep almost saying, but don't?"
                : "ask about this moment..."}
              rows={1}
              style={{
                display: "block", background: "transparent", border: "none",
                outline: "none", fontFamily: T.mono, fontSize: 12,
                color: T.text, resize: "none", width: "100%",
                lineHeight: 1.6, minHeight: 40, maxHeight: 40,
                padding: "10px 0", overflow: "hidden",
              }}
            />
            <button onClick={handleSend} style={{
              width: 30, height: 30, borderRadius: "50%",
              background: T.purple, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: "#F7F5F2", fontSize: 12,
              transition: "filter 0.15s",
            }}>↑</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── MAIN ──────────────────────────────────────────── */

export default function MeverseActII() {
  const [echoes, setEchoes] = useState(SEED);
  const [draft, setDraft] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [closing, setClosing] = useState(false);
  const [newIds, setNewIds] = useState(new Set());
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const counter = useRef(SEED.length);

  const activeEcho = echoes.find(e => e.id === activeId) || null;

  const scrollBottom = useCallback(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, []);

  useEffect(scrollBottom, [echoes.length, scrollBottom]);

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    counter.current++;
    const id = "e" + counter.current;

    // Optimistic echo — appears immediately, voltage pending
    const newEcho = {
      id, text, ts: timeNow(),
      voltage: VOLTAGE[2], // FLAT placeholder until classifier returns
      confidence: null,
      analysis: "classifying...",
      isOrigin: false, children: [],
    };
    setEchoes(prev => [...prev, newEcho]);
    setDraft("");
    setNewIds(prev => new Set(prev).add(id));
    setTimeout(() => setNewIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    }), 800);
    if (inputRef.current) {
      inputRef.current.placeholder = "breathe, captured.";
      setTimeout(() => {
        if (inputRef.current) inputRef.current.placeholder = "what's here right now...";
      }, 2000);
    }

    // Classify — update echo in place when result arrives
    try {
      const result = await classifyEcho(text);
      setEchoes(prev => prev.map(e =>
        e.id === id
          ? {
              ...e,
              voltage: VOLTAGE_MAP[result.voltage] ?? VOLTAGE[2],
              confidence: result.confidence,
              analysis: result.analysis,
            }
          : e
      ));
    } catch (_err) {
      // Failure contract: echo is never lost — stays with FLAT voltage, no analysis
      setEchoes(prev => prev.map(e =>
        e.id === id ? { ...e, analysis: "signal received." } : e
      ));
    }
  }

  function handleOpen(echo) {
    setClosing(false);
    setActiveId(echo.id);
  }

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setActiveId(null);
      setClosing(false);
    }, 250);
  }

  function handleInquiry(echoId, text) {
    setEchoes(prev => prev.map(e =>
      e.id === echoId
        ? { ...e, children: [...e.children, { text, ts: timeNow() }] }
        : e
    ));
  }

  return (
    <div style={{
      width: "100%", height: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#E8E4DE", fontFamily: T.mono,
    }}>
      <style>{CSS}</style>

      {/* phone frame */}
      <div style={{
        width: 375, height: 812,
        background: T.bg, borderRadius: 48,
        overflow: "hidden", position: "relative",
        border: "1.5px solid rgba(0,0,0,0.08)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.33), 0 0 60px rgba(0,0,0,0.06), 0 40px 80px rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}>

        {/* notch */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 110, height: 28, background: "#E8E4DE",
          borderRadius: "0 0 18px 18px", zIndex: 999,
        }} />

        {/* status bar */}
        <div style={{
          position: "absolute", top: 8, left: 24, fontSize: 11,
          fontWeight: 600, color: "rgba(0,0,0,0.25)", zIndex: 1000,
          letterSpacing: 1, fontFamily: T.mono,
        }}>9:41</div>

        {/* top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "46px 20px 12px",
          borderBottom: "1px solid rgba(0,0,0,0.02)", flexShrink: 0,
        }}>
          <div style={{ width: 34 }} />
          <div style={{
            fontFamily: T.disp, fontSize: 15,
            color: T.text, letterSpacing: 1.5,
          }}>echoes</div>
          <div style={{ width: 34 }} />
        </div>

        {/* echo list */}
        <div ref={listRef} style={{
          flex: 1, overflowY: "auto",
          padding: "10px 14px 120px",
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end", gap: 8,
          height: "calc(100% - 70px)",
        }}>
          {echoes.map(echo => (
            <EchoBubble
              key={echo.id}
              echo={echo}
              onClick={handleOpen}
              isNew={newIds.has(echo.id)}
            />
          ))}
        </div>

        {/* input bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 14px 28px",
          background: `linear-gradient(transparent, ${T.bg} 32%)`,
          zIndex: 10,
        }}>
          <div style={{
            background: T.bg2,
            border: "1px solid rgba(0,0,0,0.14)",
            borderRadius: 50, padding: "0 6px 0 18px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="what's here right now..."
              rows={1}
              style={{
                display: "block", background: "transparent", border: "none",
                outline: "none", fontFamily: T.mono, fontSize: 13,
                color: T.text, resize: "none", width: "100%",
                lineHeight: 1.6, minHeight: 44, maxHeight: 44,
                padding: "12px 0", overflow: "hidden",
              }}
            />
            <button onClick={handleSend} style={{
              width: 34, height: 34, borderRadius: "50%",
              background: T.life, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: "#F7F5F2", fontSize: 14,
              transition: "filter 0.15s, transform 0.1s",
            }}>↑</button>
          </div>
        </div>

        {/* detail panel */}
        {activeId && (
          <DetailPanel
            echo={activeEcho}
            onClose={handleClose}
            onInquiry={handleInquiry}
            closing={closing}
          />
        )}

        {/* version strip */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: 4, textAlign: "center", fontSize: 7,
          letterSpacing: 1.5, color: "rgba(0,0,0,0.15)",
          zIndex: 0, pointerEvents: "none",
        }}>v0.22.0 · act ii · capture-echo wired</div>
      </div>
    </div>
  );
}
