import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, RefreshCw, Copy, Check } from "lucide-react";

const MOTIVATIONAL_QUOTES = [
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Discipline beats motivation.", author: "Unknown" },
  { text: "Consistency is the key to success.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Atomic habits compound over time to build life-changing results.", author: "James Clear" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "If you spend too much time thinking about a thing, you'll never get it done.", author: "Bruce Lee" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" }
];

export default function QuoteCard() {
  const [currentQuote, setCurrentQuote] = useState({ text: "", author: "" });
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize random quote
  useEffect(() => {
    getRandomQuote();
  }, []);

  const getRandomQuote = () => {
    setIsAnimating(true);
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    } while (
      MOTIVATIONAL_QUOTES.length > 1 &&
      MOTIVATIONAL_QUOTES[randomIndex].text === currentQuote.text
    );

    setCurrentQuote(MOTIVATIONAL_QUOTES[randomIndex]);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="card h-full flex flex-col justify-between relative overflow-hidden group border border-[#98e1d7] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Decorative quotes icon watermark */}
      <Quote 
        size={72} 
        className="absolute -right-2 -bottom-2 text-primary/5 dark:text-slate-800/10 pointer-events-none transform rotate-180 transition-transform duration-500 group-hover:rotate-160" 
      />

      <div className="space-y-3 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-teal-500/10 text-primary dark:text-teal-400">
              <Quote size={14} />
            </span>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-muted dark:text-slate-400">
              Daily Spark
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              title="Copy quote"
              className="p-1.5 rounded-lg text-muted hover:text-primary dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {copied ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
            
            <button
              onClick={getRandomQuote}
              title="New quote"
              disabled={isAnimating}
              className={`p-1.5 rounded-lg text-muted hover:text-primary dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50 ${
                isAnimating ? "animate-spin" : ""
              }`}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="min-h-[60px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.text}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-semibold italic text-main dark:text-slate-200 leading-relaxed">
                "{currentQuote.text}"
              </p>
              <p className="text-xs text-muted dark:text-slate-400 mt-2 font-medium">
                — {currentQuote.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
