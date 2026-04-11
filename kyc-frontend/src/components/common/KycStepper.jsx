import { motion } from "framer-motion";
import { Check, FileText, Scan, UserCheck, ShieldCheck } from "lucide-react";

const steps = [
  { id: "UPLOAD", label: "Identity Scan", icon: FileText },
  { id: "OCR", label: "AI Extraction", icon: Scan },
  { id: "LIVENESS", label: "Biometric Verify", icon: UserCheck },
  { id: "RESULT", label: "Final Approval", icon: ShieldCheck },
];

export default function KycStepper({ currentStepId }) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStepId);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="relative flex justify-between items-center">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
        
        {/* Active Line */}
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 z-0 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentStepIndex / (steps.length - 1) }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <motion.div 
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted ? "#3b82f6" : isActive ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.05)",
                  borderColor: isCompleted || isActive ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
                }}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors duration-300 shadow-xl ${isActive ? "shadow-blue-500/20" : ""}`}
              >
                {isCompleted ? (
                  <Check size={20} className="text-white" />
                ) : (
                  <Icon size={20} className={isActive ? "text-blue-400" : "text-slate-500"} />
                )}
              </motion.div>
              
              <div className="flex flex-col items-center text-center">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-blue-400" : "text-slate-500"}`}>
                   Step {index + 1}
                </span>
                <span className={`text-[11px] font-display font-bold mt-1 max-w-[80px] leading-tight ${isActive ? "text-white" : "text-slate-600"}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
