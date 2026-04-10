import { useEffect, useState } from "react";
import api from "../services/api";
import { useKycStore } from "../app/store";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  ShieldX, 
  ShieldAlert, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Hash,
  ArrowRight,
  RefreshCw,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Dashboard() {
  const user = useKycStore((s) => s.user);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const userRes = await api.get(`/users/${user.id}`);
        setProfile(userRes.data);

        const statusRes = await api.get(`/kyc/status/${user.id}`);
        setStatus(statusRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const downloadCertificate = async () => {
    try {
      const response = await api.get(`/kyc/certificate/${user.id}`, {
        responseType: 'blob'
      });
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `KYC_Certificate_${user.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Certificate download failed. Please try again later.");
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 font-display font-medium animate-pulse">Synchronizing Secure Dashboard...</p>
      </div>
    );
  }

  const kycStatus = status?.kyc_status || "PENDING";
  const isVerified = kycStatus === "VERIFIED";
  const isFailed = kycStatus.includes("FAILED");
  const isManualReview = kycStatus === "MANUAL_REVIEW";

  const statusConfigs = {
    VERIFIED: {
      label: "Verified",
      icon: ShieldCheck,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      msg: "Your identity is fully verified. You have unrestricted access."
    },
    MANUAL_REVIEW: {
      label: "Under Review",
      icon: ShieldAlert,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      msg: "Our team is manually reviewing your documents. Please check back soon."
    },
    FAILED: {
      label: "Verification Failed",
      icon: ShieldX,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      msg: "We couldn't verify your details. Please re-upload clearer documents."
    },
    PENDING: {
      label: "Action Required",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      msg: "Your KYC process is incomplete. Start verification now."
    }
  };

  const config = statusConfigs[kycStatus] || statusConfigs.PENDING;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-10 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            User <span className="text-blue-500">Dashboard.</span>
          </h1>
          <p className="text-slate-400 text-base">Welcome back, {profile.first_name}. Here is your account overview.</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="relative overflow-hidden border-none shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />
             
             <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xl text-white">Profile Information</h3>
                  <Button variant="ghost" className="px-3 py-1.5 h-auto text-[10px] uppercase tracking-widest">Edit Details</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                  <InfoItem icon={User} label="First Name" value={profile.first_name} />
                  <InfoItem icon={User} label="Last Name" value={profile.last_name} />
                  <InfoItem icon={Mail} label="Email Address" value={profile.email} />
                  <InfoItem icon={Phone} label="Mobile Number" value={profile.mobile} />
                  <InfoItem icon={CreditCard} label="PAN Number" value={profile.pan_number} isMono />
                  <InfoItem icon={Hash} label="Internal ID" value={`IGT-${profile.id.toString().padStart(4, '0')}`} isMono />
                </div>
             </div>
          </Card>
        </div>

        {/* Right: KYC Status */}
        <div className="space-y-8">
          <Card className={`${config.border} ${config.bg} shadow-lg shadow-blue-500/5`}>
            <div className="flex flex-col items-center text-center space-y-6">
               <div className={`p-4 rounded-3xl ${config.bg} ${config.color} border ${config.border} shadow-inner`}>
                  <config.icon size={48} strokeWidth={1.5} />
               </div>

               <div className="space-y-2">
                 <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${config.color}`}>{config.label}</p>
                 <h4 className="text-xl font-display font-bold text-white">Verification Status</h4>
               </div>

               <p className="text-sm text-slate-400 leading-relaxed px-4">
                 {config.msg}
               </p>

               {isFailed && profile.rejection_reason && (
                 <div className="mx-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-left space-y-2">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Reason for Rejection</p>
                    <p className="text-xs text-red-200/70 leading-relaxed">{profile.rejection_reason}</p>
                 </div>
               )}

               <div className="w-full pt-2 space-y-3">
                 {kycStatus === "VERIFIED" ? (
                    <>
                      <Button className="w-full h-13">
                        Explore Features <ArrowRight size={18} className="ml-2" />
                      </Button>
                      <Button 
                        onClick={downloadCertificate}
                        variant="secondary" 
                        className="w-full h-10 bg-green-500/10 border-green-500/10 text-green-400 hover:bg-green-500/20"
                      >
                        <FileText size={16} className="mr-2" />
                        Download Certificate
                      </Button>
                    </>
                 ) : (
                    <Button onClick={() => navigate("/aadhaar")} className="w-full h-13" variant="primary">
                      {isFailed ? "Retry Verification" : "Complete KYC"}
                      <RefreshCw size={18} className="ml-2" />
                    </Button>
                 )}
               </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Security Note</h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your data is stored in a decentralized-ready format using high-end encryption. 
              We never share your personal documents with third-party vendors.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, isMono }) {
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-500/70 transition-colors duration-300">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>
      </div>
      <p className={`text-slate-100 font-medium ${isMono ? "font-mono tracking-tighter" : "font-display"}`}>
        {value || "Not provided"}
      </p>
    </div>
  );
}
