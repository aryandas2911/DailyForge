import { Link } from 'react-router-dom';
import { Github, MessageSquare, BookOpen, Heart, ArrowRight } from 'lucide-react';

export default function Footer() {
  const githubBase = "https://github.com/aryandas2911/DailyForge";
  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Tasks", path: "/tasks" },
    { label: "Routine Builder", path: "/routine-builder" },
    { label: "About", path: "/about" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#0f2926] to-[#0a1c1a] text-white border-t border-[#4eb7b3]/20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4eb7b3]/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-12 lg:col-span-4 space-y-6">
            <div className="group inline-block">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#f8fafc] group-hover:text-white transition-colors duration-300">
                DailyForge<span className="text-[#6dd5c7] animate-pulse">.</span>
              </h2>
              <div className="h-1 w-12 bg-gradient-to-r from-[#4eb7b3] to-transparent mt-2 rounded-full transition-all duration-500 group-hover:w-full"></div>
            </div>

            <p className="text-sm leading-relaxed text-[#94a3b8] max-w-sm">
              Empowering students and professionals to forge unbreakable habits through intelligent task management and mindful daily routines.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
              <a
                href={githubBase}
                target="_blank"
                rel="noreferrer"
                aria-label="DailyForge GitHub repository"
                title="DailyForge GitHub repository"
                className="p-2.5 bg-white/5 rounded-xl text-[#4eb7b3] hover:bg-[#4eb7b3] hover:text-[#0a1c1a] hover:-translate-y-1 transition-all duration-300 border border-white/10 hover:shadow-[0_0_15px_rgba(78,183,179,0.4)]"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-4 lg:col-span-2 lg:ml-auto">
            <h3 className="text-sm font-semibold tracking-wider text-white mb-6 flex items-center gap-2">
              Navigation
              <div className="h-px bg-white/10 flex-1 ml-2 md:hidden"></div>
            </h3>
            <ul className="space-y-4 text-sm">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center text-[#94a3b8] hover:text-[#4eb7b3] transition-colors duration-300"
                  >
                    <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Section */}
          <div className="md:col-span-4 lg:col-span-3">
            <h3 className="text-sm font-semibold tracking-wider text-white mb-6 flex items-center gap-2">
              Community
              <div className="h-px bg-white/10 flex-1 ml-2 md:hidden"></div>
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href={githubBase} target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-[#94a3b8] hover:text-[#4eb7b3] transition-colors duration-300">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[#4eb7b3]/10 transition-colors">
                    <Github size={14} /> 
                  </div>
                  GitHub Repo
                </a>
              </li>
              <li>
                <a href={`${githubBase}/issues`} target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-[#94a3b8] hover:text-[#4eb7b3] transition-colors duration-300">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[#4eb7b3]/10 transition-colors">
                    <MessageSquare size={14} /> 
                  </div>
                  Issues
                </a>
              </li>
              <li>
                <a href={`${githubBase}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-[#94a3b8] hover:text-[#4eb7b3] transition-colors duration-300">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[#4eb7b3]/10 transition-colors">
                    <BookOpen size={14} /> 
                  </div>
                  Contributing
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="md:col-span-4 lg:col-span-3">
            <h3 className="text-sm font-semibold tracking-wider text-white mb-6 flex items-center gap-2">
              Built With
              <div className="h-px bg-white/10 flex-1 ml-2 md:hidden"></div>
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Tailwind', 'Node.js', 'MongoDB'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-[#6dd5c7] hover:bg-[#4eb7b3]/10 hover:border-[#4eb7b3]/30 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <p className="text-[#94a3b8]">© {new Date().getFullYear()} DailyForge. All rights reserved.</p>

          <div className="flex items-center gap-2 bg-gradient-to-r from-white/5 to-white/10 px-5 py-2.5 rounded-2xl border border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)] backdrop-blur-sm">
            <span className="text-[#94a3b8]">Built with</span>
            <Heart size={14} className="text-red-400 fill-red-400 animate-pulse drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
            <span className="text-[#94a3b8]">for</span>
            <span className="text-[#4eb7b3] font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4eb7b3] to-[#6dd5c7]">GSSoC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}