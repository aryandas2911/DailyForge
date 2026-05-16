import { useState } from "react";

const CONFIG = {
  tasks: {
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
        <rect x="10" y="18" width="60" height="8" rx="4" fill="#6366f1" opacity="0.18" />
        <rect x="10" y="34" width="45" height="8" rx="4" fill="#6366f1" opacity="0.13" />
        <rect x="10" y="50" width="52" height="8" rx="4" fill="#6366f1" opacity="0.10" />
        <circle cx="56" cy="52" r="18" fill="#6366f1" opacity="0.15" />
        <path d="M46 52l6 6 12-12" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="10" y="10" width="32" height="4" rx="2" fill="#6366f1" opacity="0.35" />
      </svg>
    ),
    heading: "No tasks yet",
    subtext: "Your to-do list is empty. Add your first task and start crushing the day.",
    cta: "+ Create your first task",
  },
  routines: {
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
        <circle cx="40" cy="40" r="28" stroke="#6366f1" strokeWidth="3" opacity="0.2" />
        <circle cx="40" cy="40" r="28" stroke="#6366f1" strokeWidth="3" strokeDasharray="44 132" strokeLinecap="round" opacity="0.7" />
        <circle cx="40" cy="40" r="3" fill="#6366f1" />
        <path d="M40 40 V20" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 40 L54 48" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <circle cx="40" cy="12" r="3" fill="#6366f1" opacity="0.4" />
        <circle cx="68" cy="40" r="3" fill="#6366f1" opacity="0.25" />
        <circle cx="12" cy="40" r="3" fill="#6366f1" opacity="0.25" />
        <circle cx="40" cy="68" r="3" fill="#6366f1" opacity="0.25" />
      </svg>
    ),
    heading: "No routines saved",
    subtext: "Build consistent habits by creating your first daily routine.",
    cta: "+ Create your first routine",
  },
};

export default function EmptyState({ type = "tasks", onAction }) {
  const [hovered, setHovered] = useState(false);
  const cfg = CONFIG[type] ?? CONFIG.tasks;

  return (
    <div style={styles.wrapper}>
      <div style={styles.blob} />
      <div style={styles.iconWrap}>{cfg.icon}</div>
      <h2 style={styles.heading}>{cfg.heading}</h2>
      <p style={styles.subtext}>{cfg.subtext}</p>
      <button
        style={{ ...styles.btn, ...(hovered ? styles.btnHover : {}) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onAction}
      >
        {cfg.cta}
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "56px 32px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
    border: "1.5px dashed #c4b5fd",
    maxWidth: "420px",
    margin: "40px auto",
    textAlign: "center",
    overflow: "hidden",
    fontFamily: "'Outfit', 'Segoe UI', sans-serif",
  },
  blob: {
    position: "absolute",
    top: "-40px",
    right: "-40px",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #a78bfa55 0%, transparent 70%)",
    pointerEvents: "none",
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "#ede9fe",
    boxShadow: "0 0 0 12px #f5f3ff, 0 0 0 20px #ede9fe55",
    marginBottom: "4px",
  },
  heading: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#3730a3",
    letterSpacing: "-0.3px",
  },
  subtext: {
    margin: 0,
    fontSize: "14px",
    color: "#6d6a8a",
    lineHeight: 1.6,
    maxWidth: "300px",
  },
  btn: {
    marginTop: "8px",
    padding: "11px 28px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 14px #6366f140",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  btnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px #6366f155",
  },
};