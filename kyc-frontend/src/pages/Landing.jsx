import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle2, Globe, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Landing() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col items-center justify-center -mt-16 min-h-screen">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center space-y-12"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">AI-Powered Verification v2.0</span>
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight leading-[0.9]">
            Verify Identity at the <br />
            <span className="text-gradient">Speed of AI.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
            The world's most advanced KYC system using deep-learning OCR, 
            biometric face matching, and real-time liveness detection.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => navigate("/register")}
            className="h-14 px-10 text-lg group relative overflow-hidden btn-glow"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Verification <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:scale-105 transition-transform" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="h-14 px-8 text-lg border border-white/10 hover:bg-white/5"
            onClick={() => {
              const el = document.getElementById("features");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            How it Works
          </Button>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          variants={itemVariants} 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20"
          id="features"
        >
          <FeatureCard 
            icon={Zap} 
            title="Instant OCR" 
            desc="Extract data from Aadhaar and documents with 98% accuracy in milliseconds." 
          />
          <FeatureCard 
            icon={Shield} 
            title="Biometric Sync" 
            desc="Deep-learning face matching ensures the document owner is physically present." 
          />
          <FeatureCard 
            icon={Lock} 
            title="Secure Vault" 
            desc="AES-256 encryption for all data with automated masking for sensitive info." 
          />
        </motion.div>

        {/* Trust Indicators */}
        <motion.div variants={itemVariants} className="pt-16 border-t border-white/5 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition duration-500">
           <div className="flex items-center gap-2 font-display font-bold text-xl"><Globe size={20} /> GLOBAL REACH</div>
           <div className="flex items-center gap-2 font-display font-bold text-xl"><CheckCircle2 size={20} /> ISO CERTIFIED</div>
           <div className="flex items-center gap-2 font-display font-bold text-xl text-blue-400 italic">INDEX GLOBAL</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 text-left group">
      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
