import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PricingCard = ({ title, price, features, isPopular, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      className={`relative rounded-3xl p-8 h-full flex flex-col ${
        isPopular 
          ? "bg-gradient-to-b from-[#0B1020] to-[#050816] border border-[#4eb7b3]/50 shadow-[0_0_30px_rgba(78,183,179,0.2)]" 
          : "bg-[#0B1020] border border-white/10"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4eb7b3] to-[#82a4f6] text-[#050816] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">${price}</span>
          {price !== "Custom" && <span className="text-gray-400">/mo</span>}
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check size={18} className="text-[#4eb7b3] shrink-0 mt-0.5" />
            <span className="text-gray-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button className={`w-full py-4 rounded-xl font-medium transition-all ${
        isPopular 
          ? "bg-white text-[#050816] hover:bg-gray-100 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]" 
          : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
      }`}>
        {price === "Custom" ? "Contact Sales" : "Get Started"}
      </button>
    </motion.div>
  );
};

const Pricing = () => {
  const plans = [
    {
      title: "Hobbyist",
      price: "0",
      features: [
        "Up to 5 active routines",
        "Basic AI scheduling",
        "Community support",
        "1GB storage"
      ]
    },
    {
      title: "Pro",
      price: "29",
      isPopular: true,
      features: [
        "Unlimited routines",
        "Advanced neural scheduling",
        "Custom workflow integrations",
        "Priority support",
        "100GB storage",
        "Predictive analytics"
      ]
    },
    {
      title: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Dedicated success manager",
        "Custom AI model training",
        "SSO & advanced security",
        "Unlimited storage",
        "SLA guarantee"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Scale Without Limits
          </h2>
          <p className="text-lg text-gray-400">
            Transparent pricing designed to grow with you from your first routine to enterprise-wide deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
