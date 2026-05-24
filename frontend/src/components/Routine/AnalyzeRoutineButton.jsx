import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import "./AnalyzeRoutineButton.css";

export default function AnalyzeRoutineButton({ routineId, disabled = false }) {
  const navigate = useNavigate();

  if (!routineId || disabled) {
    return null;
  }

  return (
    <button
      onClick={() => navigate(`/optimization/${routineId}`)}
      className="analyze-button"
      title="Analyze this routine for optimization suggestions"
    >
      <Zap size={18} />
      Analyze Routine
    </button>
  );
}
