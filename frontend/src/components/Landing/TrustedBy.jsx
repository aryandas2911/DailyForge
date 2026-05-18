import React from "react";
import { motion } from "framer-motion";

const TrustedBy = () => {
  const companies = ["Acme Corp", "GlobalTech", "Nexus", "Quantum", "Synergy", "Apex", "Zenith", "Pinnacle"];

  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.02] overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050816] to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050816] to-transparent z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
          Trusted by innovative teams worldwide
        </p>
      </div>

      <div className="flex w-[200%] md:w-[150%]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
          className="flex whitespace-nowrap items-center justify-around w-full"
        >
          {[...companies, ...companies].map((company, index) => (
            <div key={index} className="px-8 text-2xl md:text-4xl font-bold text-gray-600/50 hover:text-white/80 transition-colors duration-300">
              {company}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBy;
