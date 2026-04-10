import { motion } from "framer-motion";

export default function Card({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={`
        relative overflow-hidden
        glass-card rounded-2xl p-6 sm:p-8
        hover:border-white/20 transition-colors duration-300
        ${className}
      `}
    >
      {/* Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
