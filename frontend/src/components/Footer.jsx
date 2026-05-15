import React from 'react';
import { Github, Twitter, ExternalLink, Mail, MessageSquare, BookOpen } from 'lucide-react';

export default function Footer() {
  const githubBase = "https://github.com/aryandas2911/DailyForge";

  return (
    <footer className="relative bg-[#0b1424] text-gray-300 mt-16 overflow-hidden">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">

          {/* Brand Section */}
          <div className="md:col-span-4 space-y-6">
            <div className="group inline-block cursor-default">
              <h2 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                DailyForge<span className="text-cyan-500">.</span>
              </h2>
              <div className="h-1 w-12 bg-cyan-500 mt-1 rounded-full transition-all group-hover:w-20"></div>
            </div>

            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Empowering students and professionals to forge unbreakable habits through intelligent task management.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a 
                href={githubBase} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 transition-all border border-white/5"
                title="View GitHub"
              >
                <Github size={18} />
              </a>
              {/* Add your actual Twitter/Email if you have them */}
              <button className="p-2 bg-white/5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 transition-all border border-white/5">
                <Twitter size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-6">
              Navigation
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="/dashboard" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Dashboard</a></li>
              <li><a href="/tasks" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Tasks</a></li>
              <li><a href="/routine-builder" className="hover:text-cyan-400 hover:translate-x-1 transition-all inline-block">Routine Builder</a></li>
            </ul>
          </div>

          {/* Community Section - Fixed Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-6">
              Community
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <a 
                  href={githubBase} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <Github size={14} className="text-gray-500 group-hover:text-cyan-400" /> 
                  GitHub Repository
                </a>
              </li>
              <li>
                <a 
                  href={`${githubBase}/issues`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <MessageSquare size={14} className="text-gray-500 group-hover:text-cyan-400" /> 
                  Report an Issue
                </a>
              </li>
              <li>
                <a 
                  href={`${githubBase}/blob/main/CONTRIBUTING.md`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors group"
                >
                  <BookOpen size={14} className="text-gray-500 group-hover:text-cyan-400" /> 
                  Contributing Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-6">
              Built With
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Tailwind CSS', 'Node.js', 'MongoDB'].map((tech) => (
                <span 
                  key={tech} 
                  className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-[11px] font-semibold hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px]">
          <p className="text-gray-500">
            © 2026 DailyForge. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 font-medium bg-white/5 px-4 py-2 rounded-full border border-white/5 group transition-all hover:border-cyan-500/30">
            <span>Built with</span>
            <span className="text-red-500 animate-pulse group-hover:scale-125 transition-transform">❤️</span>
            <span>for</span>
            <span className="text-cyan-400 font-bold tracking-tight">GSSoC 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}