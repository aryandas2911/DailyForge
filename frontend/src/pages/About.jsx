export default function About() {
  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto px-6 py-10 space-y-12">

      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-main">
          About <span className="text-primary">DailyForge</span>
        </h1>
        <p className="mt-4 text-muted text-lg">
          A simple and focused planner that helps you organize your day, build routines and stay consistent without overthinking.
        </p>
      </div>

      {/* What is DailyForge? */}
      <section className="max-w-5xl mx-auto card p-6">
        <h2 className="text-xl font-semibold text-main mb-2">
          What is DailyForge?
        </h2>
        <p className="text-muted leading-relaxed">
          DailyForge is a productivity tool designed to help you plan your tasks in a clear and structured way.
          Instead of juggling messy to-do lists, you can organize everything visually and manage your time better.
        </p>
      </section>

      {/* Features */}
<section className="max-w-6xl mx-auto">
  <h2 className="text-2xl font-bold text-main text-center mb-10">
    What you can do here
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

    {[
      "Add tasks with title, priority and deadline",
      "Organize your day with a clean task structure",
      "Create and manage weekly routines easily",
      "Drag and drop tasks into your schedule",
      "Track completed work and priority load clearly",
      "Simple navigation for faster planning"
    ].map((item, i) => (
      <div
        key={i}
        className="card p-8 min-h-[140px] flex items-center transition-all duration-300 hover:scale-[1.04] hover:bg-primary/10 hover:shadow-lg"
      >
        <p className="text-main text-base md:text-lg leading-relaxed">
          {item}
        </p>
      </div>
    ))}

  </div>
</section>

      {/* Why it matters */}
      <section className="text-center max-w-3xl mx-auto">
        <p className="text-muted">
          Productivity isn't about doing more — it's about doing what matters, consistently.
        </p>
        <h3 className="mt-2 text-xl font-semibold text-primary">
          DailyForge helps you stay focused, not overwhelmed.
        </h3>
      </section>

    </div>
  );
}