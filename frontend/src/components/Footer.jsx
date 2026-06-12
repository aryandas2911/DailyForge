import { Link, useLocation } from "react-router-dom";
import {
  Github,
  MessageSquare,
  BookOpen,
  Heart,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const location = useLocation();
  if (location.pathname === "/forge" || location.pathname === "/focus") {
    return null;
  }

  const githubBase = "https://github.com/aryandas2911/DailyForge";

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Tasks", path: "/tasks" },
    { label: "Routine Builder", path: "/routine-builder" },
    { label: "About", path: "/about" },
  ];

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          <div className="md:col-span-4 space-y-5">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                DailyForge<span className="text-[#3b8ea0]">.</span>
              </h2>
              <div className="h-1 w-10 bg-[#3b8ea0] mt-2 rounded-full"></div>
            </div>

            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
              Empowering students and professionals to forge unbreakable habits through intelligent task management.
            </p>

            <div className="flex gap-3">
              <a
                href={githubBase}
                target="_blank"
                rel="noreferrer"
                aria-label="DailyForge GitHub repository"
                title="DailyForge GitHub repository"
                className="p-2 bg-slate-200/50 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-[#3b8ea0] hover:text-white dark:hover:bg-[#3b8ea0] dark:hover:text-white transition-all border border-slate-300/50 dark:border-slate-700"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#3b8ea0] mb-6">
              Navigation
            </h3>
            <ul className="space-y-4 text-sm">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-600 dark:text-slate-400 hover:text-[#3b8ea0] dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#3b8ea0] mb-6">
              Community
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href={githubBase} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#3b8ea0] dark:hover:text-white transition-colors">
                  <Github size={14} /> GitHub Repo
                </a>
              </li>
              <li>
                <a href={`${githubBase}/issues`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#3b8ea0] dark:hover:text-white transition-colors">
                  <MessageSquare size={14} /> Issues
                </a>
              </li>
              <li>
                <a href={`${githubBase}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#3b8ea0] dark:hover:text-white transition-colors">
                  <BookOpen size={14} /> Contributing
                </a>
              </li>
            </ul>
          </div>
        </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#3b8ea0] mb-6">
              Built With
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Tailwind', 'Node.js', 'MongoDB'].map((tech) => (
                <span
                  key={tech}
                  className="bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700 px-3 py-1 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#94a3b8]">
            Connect with the GSSoC community and stay updated with events,
            announcements, and contribution opportunities.
          </p>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <p>© 2026 DailyForge. All rights reserved.</p>

          <div className="inline-flex items-center gap-1.5 py-1 text-slate-600 dark:text-slate-400">
            <span>Built with</span>
            <span className="inline-flex items-center justify-center">
              <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
            </span>
            <span>for</span>
            <span className="text-[#3b8ea0] font-bold">GSSoC 2026</span>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            Crafted using modern web technologies for performance, scalability,
            and an exceptional user experience.
          </p>
        </div>
      </div>
    </footer>
  );
}