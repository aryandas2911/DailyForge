import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#f7fffd] to-[#e8faf5] dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white overflow-hidden">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#4eb7b3]/25 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#98e1d7]/25 blur-3xl rounded-full" />

        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-linear-to-r from-[#3b8ea0] via-[#4eb7b3] to-[#98e1d7] bg-clip-text text-transparent py-2">
          DailyForge
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-8">
          Build routines. Forge habits. Own your week.
        </p>

        <p className="text-slate-400 max-w-2xl mb-10">
          Design powerful weekly routines with drag-and-drop scheduling,
          reusable task templates, productivity insights, and smart conflict
          detection.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/signup"
            className="px-8 py-4 rounded-xl bg-linear-to-r from-[#3b8ea0] to-[#4eb7b3] text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="px-8 py-4 rounded-xl border border-[#4eb7b3]/40 hover:border-[#4eb7b3] text-[#3b8ea0] dark:text-[#98e1d7] transition-all duration-300"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-main">
          Why DailyForge?
        </h2>

        <p className="text-center text-slate-500 dark:text-slate-300 mb-14 max-w-2xl mx-auto">
          Everything you need to organize your tasks, build routines and stay
          productive every single week.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div
            className="
      group
      rounded-3xl
      p-8
      bg-white/70 dark:bg-slate-900/70
      backdrop-blur-xl
      border border-[#98e1d7]/30
      hover:border-[#4eb7b3]/60
      hover:-translate-y-2
      transition-all duration-300
      shadow-lg hover:shadow-2xl
    "
          >
            <div className="w-14 h-14 rounded-2xl bg-[#d0f6e3] flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
              📋
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
              Smart Task Management
            </h3>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Create tasks with categories, priorities and durations. Keep your
              workflow organized without clutter.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="
      group
      rounded-3xl
      p-8
      bg-white/70 dark:bg-slate-900/70
      backdrop-blur-xl
      border border-[#98e1d7]/30
      hover:border-[#4eb7b3]/60
      hover:-translate-y-2
      transition-all duration-300
      shadow-lg hover:shadow-2xl
    "
          >
            <div className="w-14 h-14 rounded-2xl bg-[#d0f6e3] flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
              🗓️
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
              Visual Routine Builder
            </h3>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Drag and drop tasks into a weekly planner and build routines that
              fit your lifestyle and goals.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="
      group
      rounded-3xl
      p-8
      bg-white/70 dark:bg-slate-900/70
      backdrop-blur-xl
      border border-[#98e1d7]/30
      hover:border-[#4eb7b3]/60
      hover:-translate-y-2
      transition-all duration-300
      shadow-lg hover:shadow-2xl
    "
          >
            <div className="w-14 h-14 rounded-2xl bg-[#d0f6e3] flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
              📊
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
              Productivity Insights
            </h3>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Track streaks, completion rates and consistency with beautiful
              analytics and contribution heatmaps.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 pb-24">
        <h2 className="text-4xl font-bold mb-4">
          Start building better habits today
        </h2>

        <p className="text-slate-400 mb-8">
          Join DailyForge and take control of your weekly routine.
        </p>

        <Link
          to="/signup"
          className="px-10 py-4 rounded-xl bg-linear-to-r from-[#3b8ea0] to-[#4eb7b3] text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
