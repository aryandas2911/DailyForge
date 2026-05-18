import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ProductShowcase = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section id="showcase" ref={containerRef} className="py-20 relative perspective-[2000px]">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Command Your Reality
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          An interface designed to get out of your way. Experience seamless flows and instantaneous feedback.
        </p>
      </div>

      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          transformPerspective: 2000,
        }}
        className="max-w-5xl mx-auto px-6 relative z-10"
      >
        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-gray-900 shadow-[0_0_50px_rgba(78,183,179,0.2)]">
          {/* Mockup Header */}
          <div className="h-10 bg-gray-800/80 border-b border-white/10 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* Mockup Body - Recreating a basic futuristic dashboard layout */}
          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 bg-[#050816]/50 p-6 hidden md:block">
              <div className="h-8 w-32 bg-white/10 rounded mb-10"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 w-full bg-white/5 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 p-8 bg-gradient-to-br from-[#0B1020] to-[#050816]">
              <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-48 bg-white/10 rounded"></div>
                <div className="h-8 w-8 bg-white/10 rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col justify-between">
                    <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                    <div className="h-8 w-3/4 bg-white/20 rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-64 bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="h-full w-full border-b border-l border-white/10 relative">
                  {/* Fake graph lines */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path d="M0,100 C50,80 150,150 200,50 C300,10 400,100 500,20" stroke="rgba(78, 183, 179, 0.5)" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Overlay glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent pointer-events-none"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default ProductShowcase;
