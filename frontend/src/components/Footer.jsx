import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-10">
      <div className="max-w-6xl mx-auto text-center px-4">
        
        <h2 className="text-xl font-semibold">DailyForge 🚀</h2>
        <p className="text-gray-400 text-sm mt-1">
          Building consistency, one day at a time.
        </p>

        {/* Links */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <a href="/" className="hover:text-cyan-400">Home</a>
          <a href="/dashboard" className="hover:text-cyan-400">Dashboard</a>
          <a href="/tasks" className="hover:text-cyan-400">Tasks</a>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-5 mt-4 text-lg">
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            <FaGithub className="hover:text-cyan-400" />
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
            <FaLinkedin className="hover:text-cyan-400" />
          </a>
        </div>

        <p className="text-gray-500 text-xs mt-4">
          © 2026 DailyForge. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;