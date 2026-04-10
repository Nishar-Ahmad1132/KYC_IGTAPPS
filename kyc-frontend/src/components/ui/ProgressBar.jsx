import { motion } from "framer-motion";

export default function ProgressBar({ current, total, label = "Progress" }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="w-full space-y-2.5">
      <div className="flex justify-between items-end px-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {label} — Step {current} of {total}
        </span>
        <span className="text-sm font-display font-bold text-blue-500">
          {percent}%
        </span>
      </div>
      
      <div className="relative h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full relative"
        >
          {/* Animated Shine Effect */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </motion.div>
      </div>
    </div>
  );
}
