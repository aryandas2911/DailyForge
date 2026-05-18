import React from "react";
import { motion } from "framer-motion";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "CTO, TechVision",
      text: "DailyForge didn't just improve our productivity; it entirely rewired how we think about work. The AI scheduling is indistinguishable from magic.",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      name: "Marcus Cole",
      role: "Founder, Zenith",
      text: "We replaced three different tools with DailyForge. The neural engine learns so fast that it feels like it's anticipating my needs before I do.",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      name: "Elena Rodriguez",
      role: "VP Engineering",
      text: "The time-warp feature alone saved our team hundreds of hours this quarter. The UI is breathtaking and incredibly responsive.",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      name: "David Chen",
      role: "Lead Developer",
      text: "As a power user, the dark mode aesthetics combined with keyboard-first navigation makes DailyForge the absolute best platform I've used.",
      avatar: "https://i.pravatar.cc/150?img=8"
    },
    // Duplicate for seamless loop
    {
      name: "Sarah Jenkins",
      role: "CTO, TechVision",
      text: "DailyForge didn't just improve our productivity; it entirely rewired how we think about work. The AI scheduling is indistinguishable from magic.",
      avatar: "https://i.pravatar.cc/150?img=1"
    }
  ];

  return (
    <section id="testimonials" className="py-32 overflow-hidden relative bg-[#050816]">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050816] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050816] to-transparent z-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Architects of the Future
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Hear from the visionaries who are using DailyForge to redefine what's possible in a workday.
        </p>
      </div>

      <div className="flex w-[200%] md:w-[150%]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          className="flex gap-6 px-3"
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="w-[350px] md:w-[450px] shrink-0 bg-[#0B1020] rounded-2xl p-8 border border-white/5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full ring-2 ring-white/10" />
                <div>
                  <h4 className="text-white font-bold">{testimonial.name}</h4>
                  <p className="text-[#4eb7b3] text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">"{testimonial.text}"</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
