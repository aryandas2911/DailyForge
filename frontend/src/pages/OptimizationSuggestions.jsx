import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Zap, TrendingUp, CheckCircle2, Sparkles, BrainCircuit } from "lucide-react";
import api from "../api/axios.js";
import "./OptimizationSuggestions.css";

export default function OptimizationSuggestions() {
  const navigate = useNavigate();
  const { routineId } = useParams();
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, [routineId]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/optimization/routines/${routineId}/suggestions`);
      setSuggestions(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError(err.response?.data?.message || "Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-fair";
    return "score-poor";
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle size={20} className="text-red-500 animate-pulse" />;
      case "warning":
        return <AlertTriangle size={20} className="text-amber-500" />;
      default:
        return <CheckCircle2 size={20} className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <main className="optimization-page app-bg min-h-screen pt-20 flex items-center justify-center">
        <div className="ai-loading-state animate-in">
          <div className="ai-core-spinner">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
            <BrainCircuit className="brain-icon" size={32} />
          </div>
          <p className="loading-text">AI is analyzing your routine...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="optimization-page app-bg min-h-screen pt-20">
        <div className="optimization-container">
          <button onClick={() => navigate(-1)} className="back-btn hover-lift">
            <ArrowLeft size={18} />
            <span>Return to Dashboard</span>
          </button>
          <div className="error-card animate-in">
            <div className="error-icon-wrapper">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h3 className="error-title">Analysis Failed</h3>
            <p className="error-message">{error}</p>
            <button onClick={fetchSuggestions} className="retry-btn hover-lift">
              <Sparkles size={18} /> Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="optimization-page app-bg min-h-screen pt-12 pb-24">
      <div className="optimization-container">
        <button onClick={() => navigate(-1)} className="back-btn hover-lift animate-in delay-100">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {suggestions && (
          <div className="ai-dashboard">
            <header className="ai-header animate-in delay-200">
              <div className="header-content">
                <div className="title-wrapper">
                  <Sparkles className="title-icon" size={28} />
                  <h1 className="page-title text-main">AI Insights: {suggestions.routine.name}</h1>
                </div>
                {suggestions.routine.description && (
                  <p className="routine-desc text-muted">{suggestions.routine.description}</p>
                )}
              </div>
              
              <div className={`score-card ${getScoreColor(suggestions.productivityScore)} hover-lift`}>
                <div className="score-ring">
                  <span className="score-value">{suggestions.productivityScore}</span>
                </div>
                <span className="score-label">Productivity Score</span>
              </div>
            </header>

            <div className="insights-grid">
              {/* Overlap Risks */}
              {suggestions.suggestions?.overlapRisks?.length > 0 && (
                <section className="insight-section animate-in delay-300">
                  <div className="section-head">
                    <div className="icon-box critical-box">
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <h2 className="section-title text-main">Schedule Conflicts</h2>
                      <p className="section-desc text-muted">Tasks overlapping in your timeline</p>
                    </div>
                  </div>
                  <div className="cards-wrapper">
                    {suggestions.suggestions.overlapRisks.map((risk, idx) => (
                      <div key={idx} className={`ai-card conflict-card severity-${risk.severity} hover-lift`}>
                        <div className="card-header">
                          {getSeverityIcon(risk.severity)}
                          <span className={`badge badge-${risk.severity}`}>
                            {risk.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="suggestion-text">{risk.suggestion}</p>
                        {risk.tasks && (
                          <div className="task-tags">
                            {risk.tasks.map((task, i) => (
                              <span key={i} className="task-tag">{task}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Task Distribution */}
              {suggestions.suggestions?.taskDistribution?.length > 0 && (
                <section className="insight-section animate-in delay-300">
                  <div className="section-head">
                    <div className="icon-box info-box">
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <h2 className="section-title text-main">Task Distribution</h2>
                      <p className="section-desc text-muted">Workload balance analysis</p>
                    </div>
                  </div>
                  <div className="cards-wrapper">
                    {suggestions.suggestions.taskDistribution.map((item, idx) => (
                      <div key={idx} className="ai-card hover-lift">
                        <div className="card-header">
                          <span className={`badge impact-${item.impact}`}>
                            {item.impact.toUpperCase()} IMPACT
                          </span>
                          {item.day && <span className="day-badge">{item.day}</span>}
                        </div>
                        <p className="suggestion-text">{item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Break/Focus Balance */}
              {suggestions.suggestions?.breakFocusBalance?.length > 0 && (
                <section className="insight-section animate-in delay-400">
                  <div className="section-head">
                    <div className="icon-box energy-box">
                      <Zap size={22} />
                    </div>
                    <div>
                      <h2 className="section-title text-main">Energy & Focus</h2>
                      <p className="section-desc text-muted">Optimize rest intervals</p>
                    </div>
                  </div>
                  <div className="cards-wrapper">
                    {suggestions.suggestions.breakFocusBalance.map((item, idx) => (
                      <div key={idx} className="ai-card hover-lift">
                        <div className="card-header">
                          <span className={`badge impact-${item.impact}`}>
                            {item.impact.toUpperCase()} IMPACT
                          </span>
                        </div>
                        <p className="suggestion-text">{item.suggestion}</p>
                        {item.currentRatio && (
                          <div className="ratio-bar-container">
                            <span className="meta-text">Current Ratio: {item.currentRatio}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Productivity Tips */}
              {suggestions.suggestions?.productivityTips?.length > 0 && (
                <section className="insight-section animate-in delay-400">
                  <div className="section-head">
                    <div className="icon-box success-box">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h2 className="section-title text-main">Pro Tips</h2>
                      <p className="section-desc text-muted">AI-generated quick wins</p>
                    </div>
                  </div>
                  <div className="cards-wrapper tips-grid">
                    {suggestions.suggestions.productivityTips.map((item, idx) => (
                      <div key={idx} className="ai-card tip-card hover-lift">
                        <div className="card-header">
                          <span className={`badge impact-${item.impact}`}>
                            {item.impact.toUpperCase()} YIELD
                          </span>
                        </div>
                        <p className="suggestion-text">{item.tip}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Summary */}
            {suggestions.suggestions?.summary && (
              <section className="summary-card animate-in delay-500 hover-lift">
                <div className="summary-glass">
                  <div className="summary-head">
                    <BrainCircuit size={24} className="text-white" />
                    <h2 className="text-white font-bold text-lg">AI Executive Summary</h2>
                  </div>
                  <p className="summary-text">{suggestions.suggestions.summary}</p>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
