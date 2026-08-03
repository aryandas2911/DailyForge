import { useState, useEffect } from "react";

/* ── Theme ─────────────────────────────────────────────────────── */
const T = {
  bg:         "#faf6f0",
  surface:    "#ffffff",
  surfaceAlt: "#f3ede4",
  border:     "#e8ddd0",
  borderDark: "#d4c4b0",
  accent:     "#c2714f",
  accentSoft: "#c2714f18",
  accentHover:"#a85e3e",
  text:       "#2a1f16",
  textMid:    "#6b5244",
  textMuted:  "#9c8878",
  success:    "#5a9e6f",
  successSoft:"#5a9e6f18",
  danger:     "#d04f4f",
  dangerSoft: "#d04f4f18",
  warn:       "#b07d2e",
  warnSoft:   "#b07d2e18",
  navBg:      "rgba(250,246,240,0.92)",
  topBarBg:   "rgba(250,246,240,0.95)",
};

/* ── Helpers ───────────────────────────────────────────────────── */
const getToday = () => new Date().toISOString().split("T")[0];
const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const getDiff = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);

/* ── Global Styles ─────────────────────────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Bricolage+Grotesque:wght@400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: ${T.bg}; color: ${T.text}; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${T.surfaceAlt}; }
    ::-webkit-scrollbar-thumb { background: ${T.borderDark}; border-radius: 99px; }
    input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 99px; outline: none; cursor: pointer; background: ${T.border}; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${T.accent}; border: 3px solid ${T.bg}; box-shadow: 0 0 10px ${T.accent}60; cursor: pointer; }
    textarea, input, button { font-family: 'Bricolage Grotesque', sans-serif; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:none; } }
    @keyframes fadeDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:none; } }
    @keyframes popIn    { from { opacity:0; transform:scale(0.92);       } to { opacity:1; transform:scale(1); } }
    @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.4; } }
    @keyframes flicker  { 0%,100% { opacity:1; } 48% { opacity:.8; } 50% { opacity:.3; } 52% { opacity:.8; } }
    @keyframes glow     { 0%,100% { box-shadow: 0 0 16px ${T.accent}30; } 50% { box-shadow: 0 0 36px ${T.accent}60; } }
    @keyframes slideIn  { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:none; } }
    @keyframes barGrow  { from { height: 0; } to { } }
  `}</style>
);

/* ── Reusable Components ────────────────────────────────────────── */
const Card = ({ children, style = {}, glow = false }) => (
  <div style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 18,
    padding: "1.6rem",
    boxShadow: "0 2px 12px rgba(42,31,22,0.06)",
    animation: glow ? "glow 3s ease-in-out infinite" : "none",
    transition: "box-shadow 0.3s",
    ...style
  }}>{children}</div>
);

const Tag = ({ children, color = T.accent }) => (
  <span style={{
    fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase",
    color, background: `${color}18`, padding: "0.22rem 0.65rem",
    borderRadius: 99, fontWeight: 700, display: "inline-block",
    border: `1px solid ${color}30`, fontFamily: "'DM Mono'"
  }}>{children}</span>
);

const Btn = ({ children, onClick, variant = "primary", disabled, style = {} }) => {
  const [hov, setHov] = useState(false);
  const variants = {
    primary: {
      background: hov ? T.accentHover : T.accent,
      color: "#fff",
      border: "none",
      boxShadow: hov ? `0 8px 28px ${T.accent}50` : `0 4px 16px ${T.accent}30`,
    },
    ghost: {
      background: hov ? T.surfaceAlt : "transparent",
      color: T.textMid,
      border: `1.5px solid ${T.border}`,
      boxShadow: "none",
    },
    danger: {
      background: hov ? "#d04f4f22" : T.dangerSoft,
      color: T.danger,
      border: `1px solid ${T.danger}40`,
      boxShadow: "none",
    },
    success: {
      background: T.successSoft,
      color: T.success,
      border: `1px solid ${T.success}40`,
      boxShadow: "none",
    },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 700, fontSize: "0.92rem",
        borderRadius: 13, cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s cubic-bezier(.34,1.56,.64,1)",
        padding: "0.85rem 1.75rem",
        display: "inline-flex", alignItems: "center", gap: "0.45rem",
        transform: hov && !disabled ? "translateY(-2px) scale(1.015)" : "none",
        opacity: disabled ? 0.38 : 1,
        ...variants[variant], ...style
      }}
    >{children}</button>
  );
};

const FieldInput = ({ label, value, onChange, placeholder, type = "text" }) => {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      {label && <div style={{ fontFamily: "'DM Mono'", fontSize: "0.65rem", letterSpacing: "0.18em", color: T.textMuted, textTransform: "uppercase", marginBottom: "0.45rem" }}>{label}</div>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: "100%", padding: "0.88rem 1rem",
          background: focus ? T.surface : T.surfaceAlt,
          border: `1.5px solid ${focus ? T.accent : T.border}`,
          borderRadius: 12, color: T.text, fontSize: "0.95rem",
          outline: "none", transition: "all 0.2s",
          boxShadow: focus ? `0 0 0 4px ${T.accent}14` : "none",
        }}
      />
    </div>
  );
};

/* ── Nav Bar ────────────────────────────────────────────────────── */
const NavBar = ({ active, setActive, onSwitchMode }) => {
  const items = [
    { id: "dashboard", icon: "🏠", label: "Home" },
    { id: "history",   icon: "📋", label: "History" },
    { id: "settings",  icon: "⚙️", label: "Settings" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: T.navBg, backdropFilter: "blur(20px)",
      border: `1px solid ${T.border}`, borderRadius: 99,
      padding: "0.45rem 0.6rem", display: "flex", gap: "0.2rem",
      zIndex: 50, boxShadow: "0 8px 32px rgba(42,31,22,0.12)",
      animation: "fadeUp 0.5s 0.3s ease both"
    }}>
      {items.map(it => (
        <button key={it.id} onClick={() => setActive(it.id)} style={{
          background: active === it.id ? T.accent : "transparent",
          border: "none", borderRadius: 99, padding: "0.5rem 1.1rem",
          color: active === it.id ? "#fff" : T.textMuted,
          fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
          transition: "all 0.22s cubic-bezier(.34,1.56,.64,1)",
          display: "flex", alignItems: "center", gap: "0.38rem",
          boxShadow: active === it.id ? `0 4px 14px ${T.accent}45` : "none",
          transform: active === it.id ? "scale(1.04)" : "scale(1)"
        }}>
          <span>{it.icon}</span><span>{it.label}</span>
        </button>
      ))}
      <button onClick={onSwitchMode} style={{
        background: "transparent", border: "none", borderRadius: 99,
        padding: "0.5rem 0.9rem", color: T.borderDark,
        fontSize: "0.88rem", cursor: "pointer", transition: "color 0.2s"
      }}
        onMouseEnter={e => e.currentTarget.style.color = T.textMid}
        onMouseLeave={e => e.currentTarget.style.color = T.borderDark}
        title="Switch Mode"
      >⇄</button>
    </nav>
  );
};

/* ══════════════════════════════════════════════════════════════════
   SCREEN 1 — Identity Selection
══════════════════════════════════════════════════════════════════ */
function IdentityScreen({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => { setTimeout(() => setEntered(true), 60); }, []);

  const cards = [
    { id: "general", emoji: "⚡", label: "General", sub: "Everyday habits & goal tracking", accent: "#7c6a58", tag: "Classic" },
    { id: "student", emoji: "📚", label: "Student", sub: "Study streaks & daily accountability", accent: T.accent, tag: "New" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Bricolage Grotesque', sans-serif",
      padding: "2rem", position: "relative", overflow: "hidden"
    }}>
      <G />
      {/* Soft texture blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}12 0%, transparent 65%)`, top: "-8%", right: "-6%", animation: "pulse 7s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, #b07d2e12 0%, transparent 65%)`, bottom: "-5%", left: "-5%", animation: "pulse 9s 3s ease-in-out infinite" }} />
      </div>

      {/* Logo */}
      <div style={{
        textAlign: "center", marginBottom: "3.5rem",
        opacity: entered ? 1 : 0, transform: entered ? "none" : "translateY(-18px)",
        transition: "all 0.65s cubic-bezier(.34,1.56,.64,1)"
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, animation: "flicker 4s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'DM Mono'", fontSize: "0.68rem", letterSpacing: "0.35em", color: T.accent, textTransform: "uppercase" }}>DailyForge</span>
        </div>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(2.6rem, 7vw, 4.5rem)", fontWeight: 700, color: T.text, lineHeight: 1.08, letterSpacing: "-0.01em" }}>
          Who are you<br />
          <em style={{ color: T.accent, fontStyle: "italic" }}>forging</em> today?
        </h1>
        <p style={{ color: T.textMuted, marginTop: "1rem", fontSize: "0.95rem" }}>
          Pick your identity — your experience shapes around you.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {cards.map((c, i) => (
          <div
            key={c.id}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(c.id)}
            style={{
              width: 270, padding: "2.25rem 2rem",
              background: T.surface,
              border: `1.5px solid ${hovered === c.id ? c.accent : T.border}`,
              borderRadius: 22, cursor: "pointer",
              boxShadow: hovered === c.id
                ? `0 24px 64px ${c.accent}22, 0 2px 8px rgba(42,31,22,0.08)`
                : "0 2px 12px rgba(42,31,22,0.07)",
              transition: "all 0.28s cubic-bezier(.34,1.56,.64,1)",
              transform: hovered === c.id ? "translateY(-10px) scale(1.02)" : entered ? "none" : "translateY(28px)",
              opacity: entered ? 1 : 0,
              transitionDelay: `${0.08 + i * 0.1}s`,
              position: "relative"
            }}
          >
            <div style={{ position: "absolute", top: "1.1rem", right: "1.1rem" }}>
              <Tag color={c.accent}>{c.tag}</Tag>
            </div>
            <div style={{ fontSize: "2.6rem", marginBottom: "1.1rem" }}>{c.emoji}</div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: "1.35rem", fontWeight: 700, color: T.text, marginBottom: "0.4rem" }}>{c.label}</div>
            <div style={{ fontSize: "0.84rem", color: T.textMuted, lineHeight: 1.55, marginBottom: "1.6rem" }}>{c.sub}</div>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              color: c.accent, fontSize: "0.82rem", fontWeight: 700,
              transform: hovered === c.id ? "translateX(5px)" : "none",
              transition: "transform 0.2s"
            }}>Enter {c.label} →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SCREEN 2 — Student Onboarding (3 steps)
══════════════════════════════════════════════════════════════════ */
function StudentOnboarding({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(2);
  const next = () => setStep(s => s + 1);

  const steps = [
    <div key="name" style={{ animation: "fadeUp 0.45s ease" }}>
      <div style={{ fontSize: "2.8rem", marginBottom: "0.9rem" }}>👋</div>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 700, color: T.text, marginBottom: "0.45rem" }}>What's your name?</h2>
      <p style={{ color: T.textMuted, marginBottom: "2rem", fontSize: "0.88rem", lineHeight: 1.6 }}>We'll make the experience feel personal.</p>
      <FieldInput label="Your name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" />
      <Btn onClick={next} disabled={!name.trim()} style={{ width: "100%", justifyContent: "center" }}>Continue →</Btn>
    </div>,

    <div key="goal" style={{ animation: "fadeUp 0.45s ease" }}>
      <div style={{ fontSize: "2.8rem", marginBottom: "0.9rem" }}>🎯</div>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 700, color: T.text, marginBottom: "0.45rem" }}>Daily study goal</h2>
      <p style={{ color: T.textMuted, marginBottom: "2rem", fontSize: "0.88rem", lineHeight: 1.6 }}>How many hours will you commit to each day?</p>
      <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.4rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
          <span style={{ fontFamily: "'DM Mono'", fontSize: "0.68rem", color: T.textMuted, letterSpacing: "0.12em" }}>HOURS / DAY</span>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "2.4rem", fontWeight: 700, color: T.accent }}>{goal}<span style={{ fontSize: "1rem", color: T.textMuted }}>h</span></span>
        </div>
        <input type="range" min={0.5} max={12} step={0.5} value={goal}
          onChange={e => setGoal(+e.target.value)}
          style={{ width: "100%", background: `linear-gradient(to right, ${T.accent} ${(goal/12)*100}%, ${T.border} ${(goal/12)*100}%)` }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", color: T.textMuted, fontSize: "0.7rem", fontFamily: "'DM Mono'", marginTop: "0.5rem" }}>
          <span>30 min</span><span>12 hrs</span>
        </div>
      </div>
      <Btn onClick={next} style={{ width: "100%", justifyContent: "center" }}>Continue →</Btn>
    </div>,

    <div key="commit" style={{ animation: "fadeUp 0.45s ease" }}>
      <div style={{ fontSize: "2.8rem", marginBottom: "0.9rem" }}>🔥</div>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 700, color: T.text, marginBottom: "0.45rem" }}>The commitment</h2>
      <p style={{ color: T.textMuted, marginBottom: "1.75rem", fontSize: "0.88rem", lineHeight: 1.6 }}>Here's what you're signing up for, {name}.</p>
      {[
        ["📖", "Log daily", `Study ${goal}h and log it every single day.`],
        ["🔥", "Guard your streak", "Miss a day — your streak drops by 1."],
        ["📊", "Track your growth", "See your progress build over time."],
      ].map(([icon, title, desc], i) => (
        <div key={i} style={{
          display: "flex", gap: "1rem", alignItems: "flex-start",
          padding: "1rem 1.1rem", background: T.surfaceAlt,
          border: `1px solid ${T.border}`, borderRadius: 14, marginBottom: "0.7rem",
          animation: `slideIn 0.35s ${i * 0.08}s ease both`
        }}>
          <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{icon}</span>
          <div>
            <div style={{ color: T.text, fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{title}</div>
            <div style={{ color: T.textMuted, fontSize: "0.8rem", lineHeight: 1.5 }}>{desc}</div>
          </div>
        </div>
      ))}
      <Btn onClick={() => onComplete({ name, goalHours: goal, streak: 0, lastLogged: null, logs: [] })}
        style={{ width: "100%", justifyContent: "center", marginTop: "1.5rem", animation: "glow 3s ease-in-out infinite" }}>
        I'm committed — Let's go 🔥
      </Btn>
    </div>
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', sans-serif", padding: "2rem" }}>
      <G />
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "2.25rem" }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? T.accent : T.border, transition: "background 0.4s" }} />
          ))}
        </div>
        <button onClick={step === 0 ? onBack : () => setStep(s => s - 1)} style={{
          background: "none", border: "none", color: T.textMuted,
          fontSize: "0.82rem", cursor: "pointer", marginBottom: "2rem",
          display: "flex", alignItems: "center", gap: "0.3rem"
        }}>← Back</button>
        {steps[step]}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LOG MODAL
══════════════════════════════════════════════════════════════════ */
function LogModal({ goalHours, onLog, onClose }) {
  const [hours, setHours] = useState(goalHours);
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState(false);
  const met = hours >= goalHours;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(42,31,22,0.45)",
      backdropFilter: "blur(10px)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: T.surface, border: `1.5px solid ${T.border}`,
        borderRadius: 22, padding: "2.25rem", width: "100%", maxWidth: 430,
        boxShadow: "0 24px 80px rgba(42,31,22,0.18)",
        animation: "popIn 0.32s cubic-bezier(.34,1.56,.64,1)"
      }}>
        <Tag color={T.accent}>Today's Log</Tag>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.55rem", fontWeight: 700, color: T.text, margin: "0.7rem 0 1.5rem" }}>How did you study?</h2>

        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.2rem", marginBottom: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.8rem" }}>
            <span style={{ fontFamily: "'DM Mono'", fontSize: "0.65rem", color: T.textMuted, letterSpacing: "0.12em" }}>HOURS STUDIED</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 700, color: met ? T.success : T.accent }}>{hours}</span>
              <span style={{ fontSize: "0.8rem", color: T.textMuted }}>h</span>
              {met && <span style={{ fontSize: "0.72rem", color: T.success, marginLeft: "0.3rem", fontWeight: 700 }}>✓ Goal met!</span>}
            </div>
          </div>
          <input type="range" min={0.5} max={16} step={0.5} value={hours}
            onChange={e => setHours(+e.target.value)}
            style={{ width: "100%", background: `linear-gradient(to right, ${met ? T.success : T.accent} ${(hours/16)*100}%, ${T.border} ${(hours/16)*100}%)`, transition: "background 0.3s" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", color: T.textMuted, fontSize: "0.68rem", fontFamily: "'DM Mono'", marginTop: "0.4rem" }}>
            <span>30m</span><span>Goal: {goalHours}h</span><span>16h</span>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "'DM Mono'", fontSize: "0.65rem", color: T.textMuted, letterSpacing: "0.12em", marginBottom: "0.45rem" }}>WHAT DID YOU STUDY?</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            placeholder="e.g. Finished chapter 3, practiced 20 integration problems..."
            rows={3}
            style={{
              width: "100%", padding: "0.88rem 1rem",
              background: focus ? T.surface : T.surfaceAlt,
              border: `1.5px solid ${focus ? T.accent : T.border}`,
              borderRadius: 12, color: T.text, fontSize: "0.88rem",
              outline: "none", resize: "none", lineHeight: 1.6,
              boxShadow: focus ? `0 0 0 4px ${T.accent}14` : "none",
              transition: "all 0.2s"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
          <Btn onClick={() => onLog({ hours, notes, date: getToday() })} style={{ flex: 2, justifyContent: "center" }}>✓ Save Session</Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STUDENT — Home Dashboard
══════════════════════════════════════════════════════════════════ */
function StudentHome({ profile, onUpdate }) {
  const [showLog, setShowLog] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const today = getToday();
  const loggedToday = profile.logs?.some(l => l.date === today);
  const streak = profile.streak || 0;
  const totalHours = (profile.logs || []).reduce((s, l) => s + l.hours, 0);
  const avgHours = profile.logs?.length ? (totalHours / profile.logs.length).toFixed(1) : 0;

  const streakColor = streak >= 7 ? T.success : streak >= 3 ? T.accent : T.danger;
  const ringPct = Math.min(streak / 30, 1);
  const r = 52, circ = 2 * Math.PI * r;

  const handleLog = (entry) => {
    const logs = [...(profile.logs || []), entry];
    let s = profile.streak || 0;
    if (!profile.lastLogged) s = 1;
    else {
      const d = getDiff(profile.lastLogged, today);
      if (d === 1) s += 1;
      else if (d > 1) s = Math.max(0, s - (d - 1));
    }
    onUpdate({ ...profile, streak: s, lastLogged: today, logs });
    setShowLog(false);
  };

  useEffect(() => {
    if (!profile.lastLogged) return;
    const d = getDiff(profile.lastLogged, today);
    if (d > 1 && profile.streak > 0)
      onUpdate({ ...profile, streak: Math.max(0, profile.streak - (d - 1)) });
  }, []);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{
        padding: "2.5rem 1.5rem 1.5rem",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(-14px)",
        transition: "all 0.55s ease"
      }}>
        <div style={{ fontFamily: "'DM Mono'", fontSize: "0.65rem", color: T.accent, letterSpacing: "0.22em", marginBottom: "0.45rem", textTransform: "uppercase" }}>
          {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}
        </div>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "2.1rem", fontWeight: 700, color: T.text, lineHeight: 1.15 }}>
          {profile.name} <span style={{ display: "inline-block", animation: "flicker 4s ease-in-out infinite" }}>✦</span>
        </h1>
        <p style={{ color: T.textMuted, marginTop: "0.35rem", fontSize: "0.85rem" }}>
          Daily goal: <span style={{ color: T.accent, fontWeight: 700 }}>{profile.goalHours}h</span> of focused study
        </p>
      </div>

      <div style={{ padding: "0 1.25rem" }}>

        {/* Streak Card */}
        <Card style={{
          marginBottom: "1.1rem",
          background: `linear-gradient(135deg, ${streakColor}0d 0%, ${T.surface} 60%)`,
          border: `1.5px solid ${streakColor}35`,
          animation: "fadeUp 0.5s 0.1s ease both",
          display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap"
        }}>
          {/* SVG Ring */}
          <div style={{ position: "relative", width: 124, height: 124, flexShrink: 0 }}>
            <svg width="124" height="124" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="62" cy="62" r={r} fill="none" stroke={T.border} strokeWidth="7" />
              <circle cx="62" cy="62" r={r} fill="none" stroke={streakColor} strokeWidth="7"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - ringPct)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 700, color: T.text }}>{streak}</span>
              <span style={{ fontFamily: "'DM Mono'", fontSize: "0.58rem", color: T.textMuted, letterSpacing: "0.1em" }}>STREAK</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: "1.15rem", fontWeight: 700, color: T.text, marginBottom: "0.3rem" }}>
              {streak === 0 ? "Start today!" : streak < 3 ? "Getting warmed up 🌱" : streak < 7 ? "On a roll! 🔥" : "Legendary consistency 🏆"}
            </div>
            <div style={{ fontSize: "0.82rem", color: T.textMuted, lineHeight: 1.55, marginBottom: "0.8rem" }}>
              {streak === 0 ? "Log your first session to begin your streak." : `${streak} consecutive day${streak !== 1 ? "s" : ""} of studying.`}
            </div>
            <Tag color={streakColor}>
              {streak >= 7 ? "Elite" : streak >= 3 ? "Building" : "Fragile"}
            </Tag>
          </div>
        </Card>

        {/* Today's Status */}
        <Card style={{ marginBottom: "1.1rem", animation: "fadeUp 0.5s 0.18s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <Tag color={loggedToday ? T.success : T.danger}>
                {loggedToday ? "✓ Logged Today" : "⚠ Not logged yet"}
              </Tag>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "1.1rem", fontWeight: 700, color: T.text, marginTop: "0.55rem" }}>
                {loggedToday ? "You're safe today 🎉" : "Your streak is at risk!"}
              </div>
              <div style={{ fontSize: "0.81rem", color: T.textMuted, marginTop: "0.2rem" }}>
                {loggedToday ? "Come back tomorrow to keep it alive." : "Log before midnight to protect your streak."}
              </div>
            </div>
            {!loggedToday && (
              <Btn onClick={() => setShowLog(true)} style={{ animation: "glow 2.5s ease-in-out infinite", whiteSpace: "nowrap" }}>
                📖 Log Now
              </Btn>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.8rem", marginBottom: "1.1rem" }}>
          {[
            { v: `${profile.goalHours}h`, l: "Goal", i: "🎯" },
            { v: `${totalHours.toFixed(1)}h`, l: "Total", i: "⏱" },
            { v: `${avgHours}h`, l: "Avg/Day", i: "📊" },
          ].map((s, i) => (
            <Card key={s.l} style={{ textAlign: "center", padding: "1.2rem 0.5rem", animation: `fadeUp 0.5s ${0.25 + i * 0.06}s ease both` }}>
              <div style={{ fontSize: "1.3rem", marginBottom: "0.35rem" }}>{s.i}</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", fontWeight: 700, color: T.text }}>{s.v}</div>
              <div style={{ fontFamily: "'DM Mono'", fontSize: "0.6rem", color: T.textMuted, marginTop: "0.2rem", letterSpacing: "0.1em" }}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Recent sessions */}
        {profile.logs?.length > 0 && (
          <Card style={{ animation: "fadeUp 0.5s 0.38s ease both" }}>
            <div style={{ fontFamily: "'DM Mono'", fontSize: "0.62rem", color: T.textMuted, letterSpacing: "0.2em", marginBottom: "1rem", textTransform: "uppercase" }}>Recent Sessions</div>
            {[...(profile.logs || [])].reverse().slice(0, 3).map((log, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "0.85rem 0",
                borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
                animation: `slideIn 0.35s ${i * 0.08}s ease both`
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: T.text }}>
                    {log.date === today ? "Today" : fmt(log.date)}
                  </div>
                  <div style={{ fontSize: "0.77rem", color: T.textMuted, marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "1rem" }}>
                    {log.notes || "No notes added"}
                  </div>
                </div>
                <div style={{
                  background: T.accentSoft, color: T.accent,
                  padding: "0.28rem 0.75rem", borderRadius: 99,
                  fontSize: "0.78rem", fontWeight: 700, fontFamily: "'DM Mono'",
                  border: `1px solid ${T.accent}30`, flexShrink: 0
                }}>{log.hours}h</div>
              </div>
            ))}
          </Card>
        )}
      </div>
      {showLog && <LogModal goalHours={profile.goalHours} onLog={handleLog} onClose={() => setShowLog(false)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STUDENT — History
══════════════════════════════════════════════════════════════════ */
function StudentHistory({ profile }) {
  const logs = [...(profile.logs || [])].reverse();
  const today = getToday();

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const log = profile.logs?.find(l => l.date === key);
    return { key, day: d.toLocaleDateString("en", { weekday: "short" }), hours: log?.hours || 0 };
  });
  const maxH = Math.max(...weekly.map(w => w.hours), profile.goalHours, 1);

  return (
    <div style={{ padding: "2.5rem 1.25rem 100px" }}>
      <div style={{ marginBottom: "1.75rem", animation: "fadeUp 0.4s ease" }}>
        <Tag color={T.accent}>History</Tag>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.8rem", fontWeight: 700, color: T.text, marginTop: "0.6rem" }}>Your study journey</h2>
      </div>

      {/* Weekly bar chart */}
      <Card style={{ marginBottom: "1.1rem", animation: "fadeUp 0.4s 0.1s ease both" }}>
        <div style={{ fontFamily: "'DM Mono'", fontSize: "0.62rem", color: T.textMuted, letterSpacing: "0.2em", marginBottom: "1.2rem", textTransform: "uppercase" }}>This Week</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 110 }}>
          {weekly.map((w, i) => (
            <div key={w.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
              {w.hours > 0 && <div style={{ fontSize: "0.62rem", fontFamily: "'DM Mono'", color: T.textMuted }}>{w.hours}h</div>}
              <div style={{
                width: "100%", borderRadius: "5px 5px 0 0",
                background: w.hours >= profile.goalHours ? T.success : w.hours > 0 ? T.accent : T.border,
                height: `${(w.hours / maxH) * 80}px`,
                minHeight: w.hours > 0 ? 4 : 2,
                transition: `height 0.8s ${i * 0.06}s cubic-bezier(.34,1.56,.64,1)`,
                boxShadow: w.hours >= profile.goalHours ? `0 0 10px ${T.success}40` : w.hours > 0 ? `0 0 10px ${T.accent}30` : "none"
              }} />
              <div style={{ fontSize: "0.65rem", fontFamily: "'DM Mono'", color: w.key === today ? T.accent : T.textMuted, fontWeight: w.key === today ? 700 : 400 }}>{w.day}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", fontSize: "0.72rem", color: T.textMuted, fontFamily: "'DM Mono'" }}>
          <span style={{ color: T.accent }}>■ Partial</span>
          <span style={{ color: T.success }}>■ Goal met</span>
          <span style={{ color: T.border }}>■ Missed</span>
        </div>
      </Card>

      {/* Log list */}
      <Card style={{ animation: "fadeUp 0.4s 0.2s ease both" }}>
        <div style={{ fontFamily: "'DM Mono'", fontSize: "0.62rem", color: T.textMuted, letterSpacing: "0.2em", marginBottom: "1rem", textTransform: "uppercase" }}>All Sessions</div>
        {logs.length === 0 ? (
          <div style={{ color: T.border, textAlign: "center", padding: "2rem", fontSize: "0.88rem" }}>
            No sessions yet.<br />Start today!
          </div>
        ) : logs.map((log, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: "1rem 0",
            borderBottom: i < logs.length - 1 ? `1px solid ${T.border}` : "none",
            animation: `slideIn 0.3s ${Math.min(i * 0.04, 0.4)}s ease both`
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.88rem", color: T.text }}>
                  {log.date === today ? "Today" : fmt(log.date)}
                </span>
                {log.hours >= profile.goalHours && (
                  <span style={{ fontSize: "0.62rem", color: T.success, background: T.successSoft, border: `1px solid ${T.success}30`, padding: "0.1rem 0.5rem", borderRadius: 99, fontFamily: "'DM Mono'" }}>✓ Goal</span>
                )}
              </div>
              <div style={{ color: T.textMuted, fontSize: "0.79rem", lineHeight: 1.45, paddingRight: "1rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {log.notes || "No notes added"}
              </div>
            </div>
            <div style={{
              background: log.hours >= profile.goalHours ? T.successSoft : T.accentSoft,
              color: log.hours >= profile.goalHours ? T.success : T.accent,
              border: `1px solid ${log.hours >= profile.goalHours ? T.success : T.accent}30`,
              padding: "0.28rem 0.75rem", borderRadius: 99,
              fontSize: "0.78rem", fontWeight: 700, fontFamily: "'DM Mono'", flexShrink: 0
            }}>{log.hours}h</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════════════ */
function SettingsScreen({ profile, onUpdate }) {
  const [name, setName] = useState(profile?.name || "");
  const [goal, setGoal] = useState(profile?.goalHours || 2);
  const [saved, setSaved] = useState(false);

  const save = () => {
    onUpdate({ ...profile, name, goalHours: goal });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: "2.5rem 1.25rem 100px" }}>
      <div style={{ marginBottom: "1.75rem", animation: "fadeUp 0.4s ease" }}>
        <Tag color={T.accent}>Settings</Tag>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.8rem", fontWeight: 700, color: T.text, marginTop: "0.6rem" }}>Your preferences</h2>
      </div>

      <Card style={{ marginBottom: "1.1rem", animation: "fadeUp 0.4s 0.1s ease both" }}>
        <div style={{ fontFamily: "'DM Mono'", fontSize: "0.62rem", color: T.textMuted, letterSpacing: "0.2em", marginBottom: "1.25rem", textTransform: "uppercase" }}>Profile</div>
        <FieldInput label="Your name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        <div style={{ fontFamily: "'DM Mono'", fontSize: "0.65rem", color: T.textMuted, letterSpacing: "0.12em", marginBottom: "0.5rem", textTransform: "uppercase" }}>
          Daily goal — <span style={{ color: T.accent }}>{goal}h</span>
        </div>
        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
          <input type="range" min={0.5} max={12} step={0.5} value={goal}
            onChange={e => setGoal(+e.target.value)}
            style={{ width: "100%", background: `linear-gradient(to right, ${T.accent} ${(goal/12)*100}%, ${T.border} ${(goal/12)*100}%)` }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", color: T.textMuted, fontSize: "0.68rem", fontFamily: "'DM Mono'", marginTop: "0.4rem" }}>
            <span>30m</span><span>12h</span>
          </div>
        </div>
        <Btn onClick={save} variant={saved ? "success" : "primary"} style={{ width: "100%", justifyContent: "center" }}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </Btn>
      </Card>

      <Card style={{ marginBottom: "1.1rem", animation: "fadeUp 0.4s 0.2s ease both" }}>
        <div style={{ fontFamily: "'DM Mono'", fontSize: "0.62rem", color: T.danger, letterSpacing: "0.2em", marginBottom: "1rem", textTransform: "uppercase" }}>Danger Zone</div>
        <div style={{ fontSize: "0.85rem", color: T.textMuted, marginBottom: "1rem", lineHeight: 1.55 }}>
          Clearing your session history will reset your streak and all data. This cannot be undone.
        </div>
        <Btn variant="danger" onClick={() => { if (window.confirm("Clear all? This resets your streak.")) onUpdate({ ...profile, logs: [], streak: 0, lastLogged: null }); }}
          style={{ width: "100%", justifyContent: "center" }}>
          🗑 Clear All Sessions
        </Btn>
      </Card>

      <Card style={{ animation: "fadeUp 0.4s 0.3s ease both" }}>
        <div style={{ fontFamily: "'DM Mono'", fontSize: "0.62rem", color: T.textMuted, letterSpacing: "0.2em", marginBottom: "0.85rem", textTransform: "uppercase" }}>About</div>
        <div style={{ fontSize: "0.85rem", color: T.textMuted, lineHeight: 1.65 }}>
          <span style={{ color: T.accent, fontWeight: 700, fontFamily: "'Lora', serif" }}>DailyForge v2.0</span><br />
          Student Mode — built for accountability.<br />
          Log daily. Guard your streak. Stay consistent.
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   GENERAL Mode
══════════════════════════════════════════════════════════════════ */
function GeneralDashboard({ onSwitchMode }) {
  const habits = [
    { id: 1, label: "Morning workout", icon: "🏋️" },
    { id: 2, label: "Read for 30 min", icon: "📖" },
    { id: 3, label: "Drink 8 glasses of water", icon: "💧" },
    { id: 4, label: "No social media after 9pm", icon: "📵" },
    { id: 5, label: "Meditate for 10 min", icon: "🧘" },
  ];
  const [done, setDone] = useState([]);
  const toggle = id => setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      <G />
      <div style={{ padding: "2.5rem 1.25rem 100px" }}>
        <div style={{ marginBottom: "1.75rem", animation: "fadeUp 0.4s ease" }}>
          <Tag color="#7c6a58">General Mode</Tag>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 700, color: T.text, marginTop: "0.6rem" }}>Today's Habits</h1>
          <p style={{ color: T.textMuted, marginTop: "0.3rem", fontSize: "0.85rem" }}>{done.length}/{habits.length} completed</p>
        </div>

        <div style={{ background: T.border, borderRadius: 99, height: 5, marginBottom: "1.6rem", overflow: "hidden", animation: "fadeUp 0.4s 0.1s ease both" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, #7c6a58, ${T.accent})`,
            width: `${(done.length / habits.length) * 100}%`,
            transition: "width 0.5s cubic-bezier(.34,1.56,.64,1)",
          }} />
        </div>

        {habits.map((h, i) => {
          const checked = done.includes(h.id);
          return (
            <div key={h.id} onClick={() => toggle(h.id)} style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "1.05rem 1.2rem",
              background: checked ? `${T.accent}0a` : T.surface,
              border: `1.5px solid ${checked ? T.accent + "40" : T.border}`,
              borderRadius: 15, marginBottom: "0.7rem",
              cursor: "pointer",
              transition: "all 0.22s cubic-bezier(.34,1.56,.64,1)",
              opacity: checked ? 0.6 : 1,
              transform: checked ? "scale(0.99)" : "scale(1)",
              boxShadow: checked ? "none" : "0 2px 8px rgba(42,31,22,0.05)",
              animation: `fadeUp 0.4s ${0.1 + i * 0.06}s ease both`
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                border: `2px solid ${checked ? T.accent : T.borderDark}`,
                background: checked ? T.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.72rem", color: "#fff",
                transition: "all 0.2s cubic-bezier(.34,1.56,.64,1)",
                boxShadow: checked ? `0 0 10px ${T.accent}50` : "none"
              }}>{checked ? "✓" : ""}</div>
              <span style={{ fontSize: "1.15rem" }}>{h.icon}</span>
              <span style={{
                fontSize: "0.9rem", color: checked ? T.textMuted : T.text,
                textDecoration: checked ? "line-through" : "none",
                fontWeight: checked ? 400 : 600, transition: "all 0.2s", flex: 1
              }}>{h.label}</span>
            </div>
          );
        })}

        {done.length === habits.length && (
          <div style={{
            marginTop: "1.5rem", textAlign: "center", padding: "1.5rem",
            background: T.successSoft, border: `1px solid ${T.success}30`,
            borderRadius: 16, animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎉</div>
            <div style={{ color: T.success, fontWeight: 700 }}>All habits done today!</div>
            <div style={{ color: T.textMuted, fontSize: "0.83rem", marginTop: "0.25rem" }}>You crushed it. See you tomorrow.</div>
          </div>
        )}
      </div>

      <nav style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
        background: T.navBg, backdropFilter: "blur(20px)",
        border: `1px solid ${T.border}`, borderRadius: 99,
        padding: "0.45rem 0.6rem", display: "flex", gap: "0.2rem",
        zIndex: 50, boxShadow: "0 8px 32px rgba(42,31,22,0.12)",
        animation: "fadeUp 0.5s 0.3s ease both"
      }}>
        <div style={{ padding: "0.5rem 1.1rem", background: "#7c6a58", borderRadius: 99, color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>⚡ Home</div>
        <button onClick={onSwitchMode} style={{
          background: "transparent", border: "none", borderRadius: 99,
          padding: "0.5rem 0.9rem", color: T.textMuted,
          fontSize: "0.82rem", cursor: "pointer"
        }}>⇄ Switch</button>
      </nav>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("identity");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mode, setMode] = useState(null);
  const [profile, setProfile] = useState(null);

  const switchMode = () => { setScreen("identity"); setMode(null); setActiveTab("dashboard"); };

  if (screen === "identity") return <><G /><IdentityScreen onSelect={id => { setMode(id); setScreen(id === "student" ? "onboard" : "app"); }} /></>;
  if (screen === "onboard") return <><G /><StudentOnboarding onComplete={p => { setProfile(p); setScreen("app"); }} onBack={() => setScreen("identity")} /></>;
  if (mode === "general") return <><G /><GeneralDashboard onSwitchMode={switchMode} /></>;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Bricolage Grotesque', sans-serif", color: T.text }}>
      <G />
      {/* Top Bar */}
      <div style={{
        padding: "1.1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0,
        background: T.topBarBg, backdropFilter: "blur(20px)", zIndex: 40,
        boxShadow: "0 1px 8px rgba(42,31,22,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, animation: "flicker 4s infinite" }} />
          <span style={{ fontFamily: "'DM Mono'", fontSize: "0.68rem", letterSpacing: "0.28em", color: T.accent, textTransform: "uppercase" }}>DailyForge</span>
        </div>
        <Tag color={T.accent}>Student</Tag>
      </div>

      {activeTab === "dashboard" && <StudentHome profile={profile} onUpdate={setProfile} />}
      {activeTab === "history"   && <StudentHistory profile={profile} />}
      {activeTab === "settings"  && <SettingsScreen profile={profile} onUpdate={setProfile} />}

      <NavBar active={activeTab} setActive={setActiveTab} onSwitchMode={switchMode} />
    </div>
  );
}
