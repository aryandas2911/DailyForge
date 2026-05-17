import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Zap, Lock, BarChart3, Clock, Layers } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className="group relative h-full bg-[#0B1020] rounded-2xl border border-white/10 overflow-hidden p-8 hover:-translate-y-2 transition-transform duration-500"
    >
      {/* Magnetic / Flashlight Hover Effect */}
      <div 
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(78, 183, 179, 0.1), transparent 40%)`
        }}
      />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4eb7b3]/20 to-[#82a4f6]/20 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
          <Icon size={24} className="text-[#4eb7b3]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      icon: Cpu,
      title: "Neural Scheduling",
      description: "Our AI continuously learns your work habits and automatically schedules tasks when you are most productive."
    },
    {
      icon: Zap,
      title: "Instant Automation",
      description: "Chain together complex workflows with a single click. Let our agents handle the repetitive work."
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-grade encryption and decentralized storage ensuring your proprietary routines remain yours alone."
    },
    {
      icon: BarChart3,
      title: "Predictive Analytics",
      description: "Gain deep insights into your performance trends and forecast completion times with 99% accuracy."
    },
    {
      icon: Clock,
      title: "Time-Warp Engine",
      description: "Compress standard 8-hour workflows into 2 hours through optimized sequencing and AI assistance."
    },
    {
      icon: Layers,
      title: "Infinite Integration",
      description: "Seamlessly connect with your entire tech stack. If it has an API, DailyForge can orchestrate it."
    }
  ];

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Intelligent Infrastructure
          </h2>
          <p className="text-lg text-gray-400">
            Powered by next-generation models, DailyForge doesn't just manage your tasks—it actively executes them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
