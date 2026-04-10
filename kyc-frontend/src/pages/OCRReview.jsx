import { useKycStore } from "../app/store";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Fingerprint, Info, CheckCircle2, AlertCircle, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";

export default function OCRReview() {
  const ocrData = useKycStore((s) => s.ocrData);
  const navigate = useNavigate();

  if (!ocrData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle size={48} className="text-slate-700" />
        <p className="text-slate-500 font-medium">No OCR data found. Please upload your document.</p>
        <Button onClick={() => navigate("/aadhaar")} variant="secondary">Go Back</Button>
      </div>
    );
  }

  const isLowConfidence = ocrData.confidence < 0.70;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-10 py-4">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
          Review <span className="text-blue-500">Extraction.</span>
        </h1>
        <p className="text-slate-400 text-base max-w-xl">
          We've automatically extracted details from your document. Please verify them to ensure accuracy.
        </p>
        
        <div className="pt-2">
          <ProgressBar current={3} total={5} label="Data Validation" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Data Section */}
        <div className="lg:col-span-3 space-y-6">
          <Card className={`${isLowConfidence ? "border-amber-500/20" : ""}`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">Extracted Details</h3>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                  isLowConfidence 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                    : "bg-green-500/10 border-green-500/20 text-green-500"
                }`}>
                  Confidence: {Math.round(ocrData.confidence * 100)}%
                </div>
              </div>

              <div className="grid gap-5">
                <DataRow icon={User} label="Full Name" value={ocrData.name} />
                <DataRow icon={Fingerprint} label="Aadhaar Number" value={ocrData.aadhaar_number} isMasked />
                <DataRow icon={Calendar} label="Date of Birth" value={ocrData.dob} />
                <DataRow icon={Users} label="Gender" value={ocrData.gender} />
              </div>

              <div className="pt-2">
                <Button 
                  onClick={() => navigate("/selfie")} 
                  className="w-full h-13"
                >
                  Details are Correct
                  <CheckCircle2 size={18} className="ml-2" />
                </Button>
                <button 
                  onClick={() => navigate("/aadhaar")}
                  className="w-full mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-white transition"
                >
                  Incorrect details? Re-upload
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Info/Guide Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-blue-600/5 border-blue-500/20">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                <Info size={20} />
              </div>
              <h4 className="font-display font-bold text-white">Why verify?</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automatic extraction can sometimes miss characters due to blur or reflections. 
                Correct data is vital for successful verification.
              </p>
              
              <ul className="space-y-3 pt-2">
                <GuideItem text="Check for spelling errors" />
                <GuideItem text="Verify date format (DD/MM/YYYY)" />
                <GuideItem text="Ensure gender matches document" />
              </ul>
            </div>
          </Card>

          {isLowConfidence && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3"
            >
              <AlertCircle size={20} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-200/70 leading-relaxed">
                <span className="font-bold text-amber-500">Low Confidence detected.</span> We recommend double-checking the details carefully or re-uploading a clearer image.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataRow({ icon: Icon, label, value, isMasked }) {
  return (
    <div className="group space-y-1.5">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="relative">
        <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3.5 text-slate-100 font-medium group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-300">
          {value || <span className="text-slate-700 italic">Not detected</span>}
        </div>
        {isMasked && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <ShieldCheck size={16} className="text-green-500/50" />
          </div>
        )}
      </div>
    </div>
  );
}

function GuideItem({ text }) {
  return (
    <li className="flex items-center gap-3 text-xs text-slate-500">
      <div className="w-1 h-1 rounded-full bg-blue-500" />
      {text}
    </li>
  );
}
