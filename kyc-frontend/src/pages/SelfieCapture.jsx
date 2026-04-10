import Webcam from "react-webcam";
import { useRef, useState, useCallback } from "react";
import api from "../services/api";
import { useKycStore } from "../app/store";
import { useNavigate } from "react-router-dom";
import { Camera, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";

export default function SelfieCapture() {
  const webcamRef = useRef(null);
  const user = useKycStore((s) => s.user);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  const uploadSelfie = async () => {
    if (!image) return;

    setLoading(true);
    setError("");

    try {
      const blob = await fetch(image).then((r) => r.blob());
      const formData = new FormData();
      formData.append("selfie", blob, "selfie.jpg");

      await api.post(`/selfie/capture/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/liveness");
    } catch (err) {
      console.error(err);
      setError("Selfie upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-10 py-4">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
          Live <span className="text-blue-500">Selfie.</span>
        </h1>
        <p className="text-slate-400 text-base max-w-xl">
          We need a clear photo of your face to match against your document. 
          Please ensure your face is well-lit and clearly visible.
        </p>
        
        <div className="pt-2">
          <ProgressBar current={4} total={5} label="Biometric Capture" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Camera Section */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden relative border-none shadow-2xl">
            <div className="aspect-[3/4] relative bg-slate-900">
              <AnimatePresence mode="wait">
                {!image ? (
                  <motion.div 
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "user" }}
                      mirrored={true}
                      className="h-full w-full object-cover"
                    />
                    {/* Camera Overlay Guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-56 h-72 border-2 border-white/20 rounded-[100px] relative">
                         <div className="absolute inset-0 border border-white/5 rounded-[100px] scale-110" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-full"
                  >
                    <img src={image} alt="selfie" className="h-full w-full object-cover" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Indicator */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                  <div className={`w-1.5 h-1.5 rounded-full ${image ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                    {image ? "Captured" : "Live Camera"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {!image ? (
            <Button onClick={capture} className="w-full h-14" variant="primary">
              <Camera size={20} className="mr-2" />
              Capture Photo
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button onClick={() => setImage(null)} variant="secondary" className="flex-1">
                <RefreshCw size={18} className="mr-2" />
                Retake
              </Button>
              <Button onClick={uploadSelfie} loading={loading} className="flex-[2] h-14">
                Looks Good
                <CheckCircle2 size={18} className="ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Requirements Section */}
        <Card className="bg-white/5 border-white/10">
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-white">Requirements</h3>
            
            <ul className="space-y-6">
              <ReqItem label="Proper Lighting" active={!image}>
                Make sure your face is evenly lit without harsh shadows.
              </ReqItem>
              <ReqItem label="No Accessories" active={!image}>
                Remove sunglasses, hats, or any masks for the best result.
              </ReqItem>
              <ReqItem label="Look Forward" active={!image}>
                Keep a neutral expression and look directly into the camera.
              </ReqItem>
            </ul>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReqItem({ label, children, active }) {
  return (
    <li className="flex gap-4">
      <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-500 ${active ? "border-blue-500 bg-blue-500 text-white" : "border-slate-700 text-slate-700"}`}>
        <CheckCircle2 size={12} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-200 tracking-wide uppercase text-[10px]">{label}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}
