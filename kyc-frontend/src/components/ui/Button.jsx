import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Button({ 
  children, 
  onClick, 
  type = "button", 
  disabled = false, 
  loading = false, 
  variant = "primary",
  className = "" 
}) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white btn-glow",
    secondary: "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10",
    outline: "bg-transparent border border-blue-600/50 text-blue-400 hover:bg-blue-600/10",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden
        flex items-center justify-center gap-2
        px-6 py-3 rounded-xl
        font-display font-semibold text-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
