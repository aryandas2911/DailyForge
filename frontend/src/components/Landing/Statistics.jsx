import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const AnimatedCounter = ({ value, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value.substring(0, value.length)); // Handle strings with K, M, etc. later, simple implementation for now
      const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
      const duration = 2000;
      const increment = numericValue / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          clearInterval(timer);
          setCount(numericValue);
        } else {
          setCount(start);
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  // Determine if it's a float or int
  const formattedCount = Number.isInteger(parseFloat(value))
    ? Math.floor(count)
    : count.toFixed(1);

  return (
    <span ref={ref}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
};

const Statistics = () => {
  const stats = [
    { label: "Tasks Automated", value: "10", suffix: "M+", prefix: "" },
    { label: "Time Saved (Hours)", value: "500", suffix: "K", prefix: "" },
    { label: "Productivity Increase", value: "3.5", suffix: "x", prefix: "" },
    { label: "Active Users", value: "100", suffix: "K+", prefix: "" },
  ];

  return (
    <section className="py-24 relative overflow-hidden border-y border-white/5 bg-gradient-to-b from-[#0B1020] to-[#050816]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2 font-mono tracking-tighter">
                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
