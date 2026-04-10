import { motion } from "framer-motion";

export default function InputField({ 
  label, 
  icon: Icon, 
  placeholder, 
  error, 
  register, 
  type = "text",
  uppercase = false,
  className = "" 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-200">
            <Icon size={18} />
          </div>
        )}
        
        <input
          {...register}
          type={type}
          placeholder={placeholder}
          className={`
            w-full bg-slate-900/50 border border-white/5 
            rounded-xl py-3.5 px-4 
            ${Icon ? "pl-12" : ""}
            text-slate-100 placeholder:text-slate-600
            focus:bg-slate-900/80 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10
            outline-none transition-all duration-300
            ${uppercase ? "uppercase" : ""}
            ${error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10" : ""}
          `}
        />
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none group-hover:border-white/10 transition-colors duration-300" />
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs font-medium mt-1 ml-1"
        >
          {error.message}
        </motion.p>
      )}
    </div>
  );
}
