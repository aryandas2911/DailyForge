import { useContext, useEffect, useState } from "react";
import { XPContext } from "../../context/XPContext";
import { Zap } from "lucide-react";

export default function XPToast() {
  const { toast } = useContext(XPContext);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (toast) {
      setCurrent(toast);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [toast]);

  if (!current) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[9999]
        flex items-center gap-2
        px-4 py-3 rounded-2xl shadow-2xl
        bg-gradient-to-r from-amber-400 to-yellow-300
        text-slate-900 font-bold text-sm
        transition-all duration-500
        ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}
      `}
      style={{ minWidth: "180px" }}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/30">
        <Zap size={14} className="fill-slate-900" />
      </span>
      <span>+{current.amount} XP earned!</span>
    </div>
  );
}