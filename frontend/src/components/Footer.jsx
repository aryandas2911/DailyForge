import { Link, useLocation } from 'react-router-dom';
import { Github, MessageSquare, BookOpen, Heart } from 'lucide-react';

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
    <footer className="bg-[#0f2926] text-white border-t border-[#4eb7b3]/30">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">


          <div className="md:col-span-4 space-y-5">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#f8fafc]">
                DailyForge<span className="text-[#6dd5c7]">.</span>
              </h2>
              <div className="h-1 w-10 bg-[#4eb7b3] mt-2 rounded-full"></div>
            </div>

            <p className="text-sm leading-relaxed text-[#94a3b8] max-w-xs">
              Empowering students and professionals to forge unbreakable habits through intelligent task management.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href={githubBase}
                target="_blank"
                rel="noreferrer"
                aria-label="DailyForge GitHub repository"
                title="DailyForge GitHub repository"
                className="p-2 bg-white/5 rounded-lg text-[#4eb7b3] hover:bg-[#4eb7b3] hover:text-white transition-all border border-white/10"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#4eb7b3] mb-6">
              Navigation
            </h3>
            <ul className="space-y-4 text-sm">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Section */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#4eb7b3] mb-6">
              Community
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href={githubBase} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
                  <Github size={14} /> GitHub Repo
                </a>
              </li>
              <li>
                <a href={`${githubBase}/issues`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
                  <MessageSquare size={14} /> Issues
                </a>
              </li>
              <li>
                <a href={`${githubBase}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
                  <BookOpen size={14} /> Contributing
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#4eb7b3] mb-6">
              Built With
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Tailwind', 'Node.js', 'MongoDB'].map((tech) => (
                <span
                  key={tech}
                  className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-[11px] font-medium text-[#6dd5c7]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-[#94a3b8]">
          <p>© 2026 DailyForge. All rights reserved.</p>

          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <span>Built with</span>
            <Heart size={14} className="text-red-400 fill-red-400 animate-pulse" />
            <span>for</span>
            <span className="text-[#4eb7b3] font-bold">GSSoC 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}