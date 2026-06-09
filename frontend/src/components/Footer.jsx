import { Link } from 'react-router-dom';
import { Github, MessageSquare, BookOpen, Heart } from 'lucide-react';

export default function Footer() {
  const githubBase = "https://github.com/aryandas2911/DailyForge";
  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Tasks", path: "/tasks" },
    { label: "Routine Builder", path: "/routine-builder" },
    { label: "About", path: "/about" },
  ];

  return (
    <footer className="app-bg text-main mt-16 border-t border-soft">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">

          {/* Brand Section */}
          <div className="md:col-span-4 space-y-5">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-main">
                DailyForge<span className="text-[var(--primary-hover)]">.</span>
              </h2>
              {/* Subtle underline using your primary hover color */}
              <div className="h-1 w-10 bg-primary mt-2 rounded-full"></div>
            </div>

            <p className="text-sm leading-relaxed text-muted max-w-xs">
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
                className="p-2 bg-white/30 dark:bg-white/5 rounded-lg text-primary hover:bg-primary hover:text-white transition-all border border-soft"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
              Navigation
            </h3>
            <ul className="space-y-4 text-sm">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted hover:text-[var(--text-main)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Section */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
              Community
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href={githubBase} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted hover:text-[var(--text-main)] transition-colors">
                  <Github size={14} /> GitHub Repo
                </a>
              </li>
              <li>
                <a href={`${githubBase}/issues`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted hover:text-[var(--text-main)] transition-colors">
                  <MessageSquare size={14} /> Issues
                </a>
              </li>
              <li>
                <a href={`${githubBase}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted hover:text-[var(--text-main)] transition-colors">
                  <BookOpen size={14} /> Contributing
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
              Built With
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Tailwind', 'Node.js', 'MongoDB'].map((tech) => (
                <span 
                  key={tech} 
                  className="bg-white/40 dark:bg-white/5 border border-soft px-3 py-1 rounded-md text-[11px] font-medium text-[var(--text-main)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-soft flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted">
          <p>© 2026 DailyForge. All rights reserved.</p>
          
          <div className="flex items-center gap-2 bg-white/40 dark:bg-white/5 px-4 py-2 rounded-full border border-soft">
            <span>Built with</span>
            <Heart size={14} className="text-red-400 fill-red-400 animate-pulse" />
            <span>for</span>
            <span className="text-primary font-bold">GSSoC 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
