import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3b8ea0]/10 dark:bg-[#3b8ea0]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4eb7b3]/10 dark:bg-[#4eb7b3]/5 blur-3xl rounded-full pointer-events-none" />

        <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#3b8ea0] via-[#4eb7b3] to-[#98e1d7] bg-clip-text text-transparent py-2 uppercase tracking-tight">
          DailyForge
        </h1>

        <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-bold max-w-3xl mb-4 leading-relaxed">
          Build routines. Forge habits. Own your week.
        </p>

        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mb-10 leading-relaxed">
          Design powerful weekly routines with drag-and-drop scheduling,
          reusable task templates, productivity insights, and smart conflict
          detection.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/signup"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#3b8ea0] to-[#4eb7b3] text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs hover:border-[#3b8ea0] text-[#3b8ea0] dark:text-[#4eb7b3] font-bold transition-all duration-300"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-slate-900 dark:text-white uppercase tracking-wide">
          Why DailyForge?
        </h2>

        <p className="text-center text-slate-500 dark:text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
          Everything you need to organize your tasks, build routines and stay
          productive every single week.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#3b8ea0] dark:hover:border-[#4eb7b3] hover:-translate-y-2 transition-all duration-300 shadow-xs hover:shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition duration-300 border border-slate-200/40 dark:border-slate-700/60">
              📋
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Smart Task Management
            </h3>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Create tasks with categories, priorities and durations. Keep your
              workflow organized without clutter.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#3b8ea0] dark:hover:border-[#4eb7b3] hover:-translate-y-2 transition-all duration-300 shadow-xs hover:shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition duration-300 border border-slate-200/40 dark:border-slate-700/60">
              🗓️
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Visual Routine Builder
            </h3>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Drag and drop tasks into a weekly planner and build routines that
              fit your lifestyle and goals.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#3b8ea0] dark:hover:border-[#4eb7b3] hover:-translate-y-2 transition-all duration-300 shadow-xs hover:shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition duration-300 border border-slate-200/40 dark:border-slate-700/60">
              📊
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Productivity Insights
            </h3>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Track streaks, completion rates and consistency with beautiful
              analytics and contribution heatmaps.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 pb-24 space-y-4">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Start building better habits today
        </h2>

        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed pb-4">
          Join DailyForge and take control of your weekly routine.
        </p>

        <Link
          to="/signup"
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#3b8ea0] to-[#4eb7b3] text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 inline-block"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;