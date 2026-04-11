import { motion, AnimatePresence } from "framer-motion";
import { Shield, Download, X, QrCode, Calendar, User, CheckCircle2, Globe } from "lucide-react";
import Button from "../ui/Button";

export default function CertificatePreview({ isOpen, onClose, userData, onDownload }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_-20px_rgba(59,130,246,0.3)]"
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
          </div>

          <div className="relative p-8 sm:p-12 space-y-10">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Shield size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">KYC Certificate</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Index Global Technology</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Content (The "Certificate" Card) */}
            <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 overflow-hidden group">
               {/* Watermark Logo */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] rotate-12 scale-150 pointer-events-none">
                  <Shield size={300} />
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Certificate ID</p>
                       <p className="text-xs font-mono text-white">IGT-KYC-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-green-500" />
                       <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Verified Digital ID</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identity Holder</p>
                       <h3 className="text-4xl font-display font-bold text-white tracking-tight">{userData.first_name} {userData.last_name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Globe size={10} /> Status</p>
                         <p className="text-sm font-semibold text-white">Fully Verified</p>
                       </div>
                       <div className="space-y-1 text-right">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 justify-end">Issue Date <Calendar size={10} /></p>
                         <p className="text-sm font-semibold text-white">{new Date().toLocaleDateString()}</p>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-6">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                             <User size={16} />
                           </div>
                           <div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase">Aadhaar Linked</p>
                              <p className="text-[10px] font-mono text-white">XXXX XXXX {userData.aadhaar_number?.replace(/\D/g, '').slice(-4) || '8821'}</p>
                           </div>
                        </div>
                        <p className="text-[9px] text-slate-600 leading-relaxed max-w-[200px]">
                           This digital certificate confirms that the user has successfully completed all AI-driven biometric and document verification steps.
                        </p>
                     </div>
                     <div className="p-3 bg-white rounded-2xl shadow-xl shadow-blue-500/10">
                        <QrCode size={80} className="text-slate-900" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4">
               <Button 
                onClick={onDownload} 
                className="flex-1 h-14 text-lg group bg-white text-slate-900 hover:bg-slate-100 dark:bg-white dark:text-slate-900"
               >
                  <Download size={20} className="mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Download PDF
               </Button>
               <Button 
                onClick={onClose} 
                variant="ghost" 
                className="flex-1 h-14 text-lg border border-white/10 hover:bg-white/5"
               >
                  Close Preview
               </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
