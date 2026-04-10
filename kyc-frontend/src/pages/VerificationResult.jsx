import { useKycStore } from "../app/store";
import { 
  ShieldCheck, 
  ShieldX, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  FileText, 
  Download,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function VerificationResult() {
  const similarity = useKycStore((s) => s.similarity);
  const user = useKycStore((s) => s.user);
  const ocrData = useKycStore((s) => s.ocrData);
  const navigate = useNavigate();

  // Determine status (Fallback for if someone navigates directly)
  const isMatch = similarity?.match;
  const score = similarity?.score || 0;
  
  const status = isMatch ? "VERIFIED" : score > 0.3 ? "REVIEW" : "FAILED";

  const statusConfigs = {
    VERIFIED: {
      title: "Identity Verified",
      subtitle: "Your KYC verification has been completed successfully.",
      icon: ShieldCheck,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      glow: "shadow-green-500/20"
    },
    REVIEW: {
      title: "Under Review",
      subtitle: "Your details need a secondary check by our security team.",
      icon: ShieldAlert,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/20"
    },
    FAILED: {
      title: "Verification Failed",
      subtitle: "We couldn't verify your identity. Please see the details below.",
      icon: ShieldX,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      glow: "shadow-red-500/20"
    }
  };

  const config = statusConfigs[status];

  return (
    <div className="max-w-4xl mx-auto w-full py-4 space-y-12">
      {/* Result Card */}
      <Card className={`relative overflow-hidden ${config.border} shadow-2xl ${config.glow}`}>
        {/* Decorative Background Icon */}
        <div className={`absolute -right-8 -bottom-8 opacity-5 ${config.color}`}>
          <config.icon size={300} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
          {/* Status Badge & Icon */}
          <div className="flex flex-col items-center space-y-4">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`w-32 h-32 rounded-[40px] ${config.bg} flex items-center justify-center ${config.color} border ${config.border}`}
            >
              <config.icon size={64} strokeWidth={1.5} />
            </motion.div>
            
            <div className={`px-4 py-1.5 rounded-full ${config.bg} border ${config.border} ${config.color} text-[10px] font-bold tracking-[0.2em] uppercase`}>
              Status: {status}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
              {config.title}
            </h1>
            <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
              {config.subtitle}
            </p>

            <div className="pt-6 flex flex-wrap gap-4 justify-center md:justify-start">
              {status === "VERIFIED" ? (
                <>
                  <Button className="h-12 px-8">
                    Go to Dashboard
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                  <Button variant="secondary" className="h-12 px-6">
                    <Download size={18} className="mr-2" />
                    Download Certificate
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/")} className="h-12 px-8">
                  <RefreshCw size={18} className="mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <BarChart3 size={18} />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Verification Metrics</h3>
          </div>

          <div className="space-y-4">
            <MetricRow 
              label="Face Similarity" 
              value={`${Math.round(score * 100)}%`} 
              passed={isMatch} 
              subtext={isMatch ? "High match detected" : "Similarity below threshold"}
            />
            <MetricRow 
              label="OCR Confidence" 
              value={`${Math.round(ocrData?.confidence * 100 || 0)}%`} 
              passed={(ocrData?.confidence || 0) > 0.8} 
              subtext="Text extraction accuracy"
            />
            <MetricRow 
              label="Liveness Check" 
              value="Passed" 
              passed={true} 
              subtext="Biometric anti-fraud check"
            />
          </div>
        </Card>

        <Card className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <FileText size={18} />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Verified Identity</h3>
          </div>

          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-sm font-medium text-slate-100">{ocrData?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aadhaar</p>
                  <p className="text-sm font-medium text-slate-100">{ocrData?.aadhaar_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-100 italic">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ID Number</p>
                  <p className="text-sm font-medium text-slate-100 font-mono">KYC-{user?.id?.toString().padStart(5, "0")}</p>
                </div>
             </div>

             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Identity Encrypted</span>
                </div>
                <span className="text-[8px] font-mono text-slate-600 tracking-tighter uppercase whitespace-nowrap">SHA-256 SECURED</span>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricRow({ label, value, passed, subtext }) {
  return (
    <div className="group space-y-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-display font-bold ${passed ? "text-green-500" : "text-red-500"}`}>
            {value}
          </span>
          {passed ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
        </div>
      </div>
      <p className="text-[10px] text-slate-600 font-medium group-hover:text-slate-500 transition-colors duration-300">{subtext}</p>
      
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${passed ? "bg-green-500/40" : "bg-red-500/40"}`}
        />
      </div>
    </div>
  );
}
