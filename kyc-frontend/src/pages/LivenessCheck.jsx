import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import api from "../services/api";
import { useKycStore } from "../app/store";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertCircle, Scan, ArrowRight, Eye, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";

const steps = [
  { action: "blink", text: "Please Blink Your Eyes", icon: Eye },
  { action: "left", text: "Turn Your Head LEFT", icon: RotateCcw },
  { action: "right", text: "Turn Your Head RIGHT", icon: RotateCcw, flip: true },
];

export default function LivenessCheck() {
  const webcamRef = useRef(null);
  const user = useKycStore((s) => s.user);
  const setSimilarity = useKycStore((s) => s.setSimilarity);
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const captureFrames = async () => {
    const formData = new FormData();
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 400));
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) continue;
      const blob = await fetch(imageSrc).then((r) => r.blob());
      formData.append("frames", blob, `frame_${i}.jpg`);
    }
    return formData;
  };

  const runStep = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");

    try {
      const current = steps[stepIndex];
      const formData = await captureFrames();
      const res = await api.post(
        `/liveness/step/${user.id}?action=${current.action}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (!res.data.success) {
        setError(`${current.text} not detected. Please try again.`);
        setLoading(false);
        return;
      }

      if (stepIndex < steps.length - 1) {
        setStepIndex((prev) => prev + 1);
        setLoading(false);
      } else {
        setSuccess(true);
        await completeFaceMatch();
      }
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please ensure you are in a well-lit area.");
      setLoading(false);
    }
  };

  const completeFaceMatch = async () => {
    try {
      const res = await api.post(`/kyc/face-match/${user.id}`);
      setSimilarity({
        score: res.data.similarity,
        match: res.data.match,
      });
      setTimeout(() => navigate("/verification"), 1500);
    } catch (err) {
      console.error(err);
      setError("Face matching failed.");
      setLoading(false);
    }
  };

  const currentStep = steps[stepIndex];

  return (
    <div className="max-w-4xl mx-auto w-full space-y-10 py-4 font-sans">
      {/* Header Section */}
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
          Liveness <span className="text-blue-500">Validation.</span>
        </h1>
        <p className="text-slate-400 text-base max-w-xl">
          Follow the instructions to verify you are a real person. 
          This prevents fraud and secures your account.
        </p>
        
        <div className="pt-2">
          <ProgressBar current={stepIndex + 1} total={steps.length} label="Anti-Fraud Check" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Webcam HUD Section */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000" />
          
          <Card className="p-0 overflow-hidden relative border-none shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] min-h-[400px]">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              audio={false}
              mirrored={true}
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full object-cover grayscale-[0.3] brightness-90 contrast-110"
            />

            {/* Scanning HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner Brackets */}
              <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-blue-500/60 rounded-tl-2xl" />
              <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-blue-500/60 rounded-tr-2xl" />
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-blue-500/60 rounded-bl-2xl" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-blue-500/60 rounded-br-2xl" />

              {/* Central Face Guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-64 h-80 border-2 rounded-[100px] transition-all duration-700 ${
                  loading ? "border-blue-500/80 scale-105 shadow-[0_0_40px_rgba(59,130,246,0.2)]" : 
                  success ? "border-green-500/80 shadow-[0_0_40px_rgba(34,197,94,0.3)]" : 
                  "border-white/20"
                }`}>
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Data Overlay Sideload */}
              <div className="absolute top-10 right-10 flex flex-col items-end space-y-2 opacity-60">
                <div className="px-2 py-0.5 rounded-sm bg-blue-500/20 border border-blue-500/40 text-[8px] font-mono text-blue-400">FACIAL_ID: ACTIVE</div>
                <div className="px-2 py-0.5 rounded-sm bg-blue-500/20 border border-blue-500/40 text-[8px] font-mono text-blue-400">FPS: 30.2</div>
                <div className="px-2 py-0.5 rounded-sm bg-blue-500/20 border border-blue-500/40 text-[8px] font-mono text-blue-400">SENS_LVL: HIGH</div>
              </div>
            </div>

            {/* Succes Overlay */}
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500"
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="p-6 rounded-full bg-green-500 text-white shadow-[0_0_50px_rgba(34,197,94,0.5)]"
                  >
                    <CheckCircle2 size={64} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Instructions Section */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div 
              key={stepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <currentStep.icon size={32} className={currentStep.flip ? "scale-x-[-1]" : ""} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Action Required</p>
                  <h2 className="text-2xl font-display font-bold text-white tracking-wide">{currentStep.text}</h2>
                </div>
              </div>

              <p className="text-slate-400 leading-relaxed text-sm">
                Position your face within the center guide and {currentStep.text.toLowerCase().replace('please ', '')} when you hit the button below. 
                Our system will capture multiple frames for analysis.
              </p>
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <div className="space-y-4 pt-4">
            <Button 
              onClick={runStep} 
              loading={loading} 
              className="w-full h-16 text-lg tracking-wide"
              variant="primary"
            >
              {loading ? "Analyzing Frames..." : "Start Analysis"}
              {!loading && <Scan size={20} className="ml-2" />}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <ShieldCheck size={12} className="text-green-500" />
              Secured by IGT Anti-Fraud AI
            </div>
          </div>
        </div>
      </div>

      {/* Loading Modal Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6"
          >
            <div className="text-center space-y-6 max-w-sm">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent" 
                />
                <Scan size={32} className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-display font-bold text-white tracking-wide">Processing Biometrics</h4>
                <p className="text-sm text-slate-400">Our neural engine is analyzing your movement for liveness detection...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
