import { useContext } from "react";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const homePath = user ? "/dashboard" : "/login";

  const handleGoHome = () => {
    navigate(homePath, { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-[calc(100vh-3.75rem)] w-full flex items-center justify-center px-4 py-10 md:px-6">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(78,183,179,0.18),_transparent_52%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.82))] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="absolute inset-0 opacity-70 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_24%,transparent_76%,rgba(255,255,255,0.04)_100%)]" />
        <div className="relative px-6 py-14 sm:px-10 sm:py-16 md:px-14">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted"
            >
              <Sparkles size={14} className="text-primary" />
              Lost in the forge
            </div>

            <p className="text-7xl font-black tracking-tighter text-main sm:text-8xl md:text-[8rem]">
              404
            </p>

            <div className="mt-4 space-y-3 sm:mt-6">
              <h1 className="text-3xl font-bold tracking-tight text-main sm:text-4xl">
                Page Not Found
              </h1>
              <p className="mx-auto max-w-md text-sm leading-6 text-muted sm:text-base">
                The page you&apos;re trying to open doesn&apos;t exist, may have been moved, or the link is outdated.
              </p>
            </div>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
              <button
                onClick={handleGoHome}
                className="btn btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold cursor-pointer"
              >
                <Home size={16} />
                {user ? "Go to Dashboard" : "Go to Login"}
              </button>

              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-main transition-all duration-200 hover:-translate-y-[1px] hover:bg-white/10 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
