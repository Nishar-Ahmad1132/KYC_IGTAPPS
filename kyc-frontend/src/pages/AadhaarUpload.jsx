import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useKycStore } from "../app/store";
import { UploadCloud, FileCheck, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";

export default function AadhaarUpload() {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = useKycStore((s) => s.user);
  const setOcrData = useKycStore((s) => s.setOcrData);
  const navigate = useNavigate();

  const upload = async () => {
    if (!front || !back) {
      setError("Please upload both Front and Back images.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("front", front);
    formData.append("back", back);

    try {
      const res = await api.post(`/upload/aadhaar/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOcrData(res.data.ocr_result);
      navigate("/ocr-review");
    } catch (err) {
      console.error(err);
      setError("Document analysis failed. Please ensure the images are clear.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-10 py-4">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
          Verify Your <span className="text-blue-500">Aadhaar.</span>
        </h1>
        <p className="text-slate-400 text-base max-w-xl">
          Upload clear photos of your Aadhaar card (Front and Back). Use high-quality images for faster processing.
        </p>
        
        <div className="pt-2">
          <ProgressBar current={2} total={5} label="Document Upload" />
        </div>
      </div>

      <Card className="shadow-2xl shadow-blue-500/5">
        <div className="space-y-8">
          {/* Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadBox 
              label="Aadhaar Front" 
              file={front} 
              setFile={setFront} 
              description="Front side with photo"
            />
            <UploadBox 
              label="Aadhaar Back" 
              file={back} 
              setFile={setBack} 
              description="Back side with address"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Info */}
          <div className="flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl group transition-colors duration-300 hover:bg-blue-500/10">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-blue-200 font-semibold tracking-wide uppercase text-[10px]">Secure Processing</p>
              <p className="text-slate-400 leading-relaxed">
                Your data is processed using local AI models. We use bank-grade encryption to ensure your privacy.
              </p>
            </div>
          </div>

          <Button 
            onClick={upload} 
            loading={loading} 
            className="w-full h-14"
            disabled={!front || !back}
          >
            {loading ? "Analyzing Document..." : "Continue to Analysis"}
          </Button>
        </div>
      </Card>
      
      {/* Tips Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-60">
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Tip 01</p>
          <p className="text-xs text-slate-400">Ensure good lighting and avoid reflections.</p>
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Tip 02</p>
          <p className="text-xs text-slate-400">Keep all four corners of the card visible.</p>
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Tip 03</p>
          <p className="text-xs text-slate-400">Supported formats: JPG, PNG (Max 5MB).</p>
        </div>
      </div>
    </div>
  );
}

function UploadBox({ label, file, setFile, description }) {
  return (
    <label className="block cursor-pointer group">
      <div className={`
        relative overflow-hidden
        border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300
        ${file 
          ? "border-blue-500/50 bg-blue-500/5 shadow-inner" 
          : "border-slate-800 bg-slate-900/40 hover:border-blue-500/30 hover:bg-blue-500/5"
        }
      `}>
        {/* State Icon */}
        <div className={`
          mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300
          ${file ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500 group-hover:bg-blue-500/20 group-hover:text-blue-400"}
        `}>
          {file ? <FileCheck size={24} /> : <UploadCloud size={24} />}
        </div>

        <div className="space-y-1">
          <p className={`font-display font-semibold transition-colors duration-300 ${file ? "text-white" : "text-slate-300 group-hover:text-blue-300"}`}>
            {label}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            {file ? file.name : description}
          </p>
        </div>

        {/* Image Preview */}
        <AnimatePresence>
          {file && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 relative"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-50" />
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="relative mx-auto max-h-40 rounded-xl border border-white/10 shadow-lg object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>
    </label>
  );
}
