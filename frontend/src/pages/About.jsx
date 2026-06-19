import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Layers3,
  ListChecks,
  Target,
  Timer,
} from "lucide-react";

const features = [
  {
    title: "Task planning",
    description:
      "Create focused tasks with priorities, deadlines, and clear next steps for the day.",
    icon: ListChecks,
  },
  {
    title: "Routine building",
    description:
      "Design weekly routines that turn repeat work, habits, and goals into a visible plan.",
    icon: CalendarCheck,
  },
  {
    title: "Focus support",
    description:
      "Use dedicated focus tools to protect deep work time and reduce context switching.",
    icon: Timer,
  },
  {
    title: "Progress insights",
    description:
      "Review analytics, consistency, and completion patterns to understand what is working.",
    icon: BarChart3,
  },
];

const benefits = [
  "Replace scattered notes with one organized productivity workspace.",
  "Reduce daily planning friction by keeping tasks, routines, and progress together.",
  "Build consistency through repeatable systems instead of relying on motivation alone.",
  "Make better decisions with visible priorities, schedules, and productivity trends.",
];

const goals = [
  "Help users plan days that feel realistic and intentional.",
  "Make routine building approachable for students, creators, and professionals.",
  "Keep productivity data useful, simple, and easy to act on.",
];

export default function About() {
  return (
    <div className="w-full">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-12 pt-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/60 px-4 py-2 text-sm font-semibold text-main shadow-sm dark:bg-white/[0.04]">
          <Compass size={16} aria-hidden="true" />
          Built for intentional daily momentum
        </div>

        <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight text-main sm:text-5xl lg:text-6xl">
          About <span className="text-primary">DailyForge</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          DailyForge is a productivity platform for planning tasks, shaping
          routines, tracking progress, and turning scattered intentions into a
          practical rhythm for each day.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/signup" className="btn btn-primary px-6 py-3">
            Start planning
          </Link>
          <Link
            to="/login"
            className="btn border border-[var(--border)] bg-white/70 px-6 py-3 text-main hover:bg-white dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
          >
            View dashboard
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="card">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Target size={24} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-main">What DailyForge is</h2>
          <p className="mt-4 leading-7 text-muted">
            DailyForge brings task management, routine planning, focus time, and
            productivity analytics into one calm workspace. It is designed for
            people who want a simple way to decide what matters, schedule it,
            and follow through with less mental clutter.
          </p>
        </div>

        <div className="card">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Layers3 size={24} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-main">Mission and purpose</h2>
          <p className="mt-4 leading-7 text-muted">
            The mission is to help users build sustainable systems for their
            work and personal goals. DailyForge focuses on clarity,
            consistency, and reflection so planning becomes a habit instead of
            another source of pressure.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-3xl font-black text-main">Key platform features</h2>
          <p className="mt-3 leading-7 text-muted">
            DailyForge combines the core pieces users need to plan, execute,
            and learn from their routines.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const FeatureIcon = feature.icon;

            return (
              <article key={feature.title} className="card h-full">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <FeatureIcon size={22} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-main">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="card">
          <h2 className="text-2xl font-bold text-main">Problems it solves</h2>
          <p className="mt-4 leading-7 text-muted">
            DailyForge is built for the everyday friction of productivity:
            unclear priorities, fragmented planning tools, forgotten routines,
            and progress that is hard to measure.
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-main">Benefits for users</h2>
          <ul className="mt-5 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-muted">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="leading-6">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card">
            <h2 className="text-2xl font-bold text-main">Mission and vision</h2>
            <p className="mt-4 leading-7 text-muted">
              The long-term vision for DailyForge is a friendly productivity
              companion that helps people plan with confidence, protect time for
              meaningful work, and improve through steady feedback.
            </p>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-main">Platform goals</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {goals.map((goal) => (
                <li
                  key={goal}
                  className="rounded-lg border border-[var(--border)] bg-primary/10 p-4 text-sm leading-6 text-main"
                >
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="card">
            <h2 className="text-2xl font-bold text-main">Technology overview</h2>
            <p className="mt-4 leading-7 text-muted">
              DailyForge uses a modern web stack with React on the frontend and
              a Node.js backend. The platform is organized around responsive UI,
              authenticated user workflows, task and routine data, and analytics
              that help users understand their productivity patterns.
            </p>
          </div>

          <div className="card flex flex-col justify-between bg-primary/10">
            <div>
              <h2 className="text-2xl font-bold text-main">
                Ready to forge a clearer day?
              </h2>
              <p className="mt-4 leading-7 text-muted">
                Start with a few priorities, build a routine around them, and
                let DailyForge help you keep momentum visible.
              </p>
            </div>
            <Link to="/signup" className="btn btn-primary mt-6 w-full py-3 sm:w-fit">
              Create your account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
