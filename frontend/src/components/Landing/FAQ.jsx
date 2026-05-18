import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-lg font-medium text-white group-hover:text-[#4eb7b3] transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-gray-400 group-hover:text-[#4eb7b3] transition-colors"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "How does the Neural Scheduling actually work?",
      answer: "Our system analyzes your past task completion times, active hours, and explicitly stated preferences. Using this data, it builds a personalized productivity model that predicts the optimal time for you to tackle specific types of tasks."
    },
    {
      question: "Can I integrate DailyForge with my existing tools?",
      answer: "Yes. DailyForge offers over 100+ native integrations out of the box, including Jira, GitHub, Slack, and Notion. For custom tools, we provide a comprehensive REST API and webhooks."
    },
    {
      question: "Is my data secure?",
      answer: "Security is our foundational principle. All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We undergo regular third-party security audits and maintain SOC2 Type II compliance."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "We don't believe in hard cutoffs. If you exceed your limits, your existing routines will continue to function normally. We'll simply notify you and you won't be able to create new routines until you upgrade."
    }
  ];

  return (
    <section className="py-32 relative max-w-4xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="bg-[#0B1020] rounded-3xl p-8 md:p-12 border border-white/5 shadow-2xl">
        {faqs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
