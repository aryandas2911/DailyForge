import React from "react";
import { Link } from "react-router-dom";
import { Rocket, Twitter, Github, Linkedin } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="relative bg-[#050816] pt-20 pb-10 overflow-hidden border-t border-white/10">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none mesh-bg mix-blend-screen"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4eb7b3] to-[#82a4f6] flex items-center justify-center">
                <Rocket size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">DailyForge</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering the next generation of builders with intelligent systems and automated workflows.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">API Reference</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#4eb7b3] transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} DailyForge Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
