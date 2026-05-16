import { createContext, useCallback, useContext, useState } from "react";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", top: "1.25rem", right: "1.25rem", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.5rem", pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              pointerEvents: "auto", cursor: "pointer",
              minWidth: "240px", padding: "0.75rem 1rem",
              borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500,
              color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              background: t.type === "success" ? "#22c55e" : "#ef4444",
              animation: "toastIn 0.25s ease-out both",
            }}
          >
            {t.type === "success" ? "✓ " : "✕ "}{t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.showToast;
}
