import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  Shield,
  ShieldCheck, 
  ShieldX, 
  ExternalLink, 
  User, 
  Users,
  FileText, 
  Camera, 
  AlertCircle,
  Check,
  X,
  MessageSquare,
  Activity,
  Zap,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const STATUS_COLORS = {
    'VERIFIED': '#22c55e',
    'FACE VERIFIED': '#3b82f6',
    'BASIC SUBMITTED': '#6366f1',
    'FAILED': '#ef4444',
    'MANUAL REVIEW': '#f59e0b',
    'PENDING': '#64748b'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchAnalytics()]);
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/kyc-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/admin/approve/${userId}`);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert("Approval failed");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert("Please provide a reason");
    try {
      await api.post(`/admin/reject/${selectedRequest.user.id}?reason=${rejectionReason}`);
      fetchRequests();
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason("");
    } catch (err) {
      alert("Rejection failed");
    }
  };

  const aiSuccess = requests.filter(r => ["VERIFIED", "FACE_VERIFIED", "NAME_VERIFIED"].includes(r.user.kyc_status));
  const attentionRequired = requests.filter(r => !["VERIFIED", "FACE_VERIFIED", "NAME_VERIFIED"].includes(r.user.kyc_status));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Admin Console...</p>
      </div>
    );
  }

  const UserItem = ({ req }) => (
    <motion.div 
      key={req.user.id} 
      whileHover={{ x: 4 }}
      onClick={() => setSelectedRequest(req)}
      className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 ${
        selectedRequest?.user.id === req.user.id 
          ? "bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5" 
          : "bg-white/5 border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">{req.user.first_name} {req.user.last_name}</p>
          <p className="text-[10px] font-medium text-slate-500">{req.user.email}</p>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
          req.user.kyc_status === 'VERIFIED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          req.user.kyc_status === 'BASIC_SUBMITTED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        }`}>
          {req.user.kyc_status.replace('_', ' ')}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Admin <span className="text-blue-500">Review Panel.</span></h1>
          <p className="text-slate-400 text-sm">Managing {requests.length} total system interactions.</p>
        </div>
        
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={requests.length} 
          trend="+12%" 
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard 
          icon={ShieldCheck} 
          label="Verified" 
          value={aiSuccess.length} 
          trend="+5%" 
          color="text-green-500"
          bg="bg-green-500/10"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Pending Review" 
          value={attentionRequired.length} 
          trend="-2%" 
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatCard 
          icon={Zap} 
          label="AI Efficiency" 
          value={`${Math.round((aiSuccess.length / (requests.length || 1)) * 100)}%`} 
          trend="Optimal" 
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
      </div>
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 border-white/5 bg-slate-900/30">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-500" /> KYC Status Distribution
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {analytics.status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 border-white/5 bg-slate-900/30">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle size={14} className="text-blue-500" /> 7-Day Registration Trend
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.registration_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Requests List */}
        <div className="lg:col-span-1 space-y-8">
          <div className="h-[75vh] overflow-y-auto pr-2 custom-scrollbar space-y-8">
            {/* Activity Feed [NEW] */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                <span className="flex items-center gap-2"><Activity size={14} /> System Activity</span>
                <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-slate-600">LIVE</span>
              </h3>
              <div className="space-y-3">
                {requests.slice(0, 4).map((req, i) => (
                   <ActivityItem 
                    key={i}
                    user={`${req.user.first_name}`}
                    action={req.user.kyc_status === 'VERIFIED' ? 'Passed Auto-Check' : 'Started Verification'}
                    time={`${i + 2}m ago`}
                    status={req.user.kyc_status}
                   />
                ))}
              </div>
            </div>

            {/* Needs Attention Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <AlertCircle size={14} /> Review Queue ({attentionRequired.length})
              </h3>
              {attentionRequired.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/5">
                   <p className="text-slate-600 text-xs italic">Queue is clear.</p>
                </div>
              ) : (
                attentionRequired.map(req => <UserItem key={req.user.id} req={req} />)
              )}
            </div>

            {/* AI Verified Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <ShieldCheck size={14} /> Success Log ({aiSuccess.length})
              </h3>
              {aiSuccess.length === 0 ? (
                <p className="text-slate-600 text-xs italic ml-1">No automated successes yet.</p>
              ) : (
                aiSuccess.map(req => <UserItem key={req.user.id} req={req} />)
              )}
            </div>
          </div>
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedRequest ? (
              <motion.div
                key={selectedRequest.user.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-8"
              >
                <Card className="border-blue-500/20 shadow-blue-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Verification Details</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">User ID: #{selectedRequest.user.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <Button onClick={() => setShowRejectModal(true)} variant="secondary" className="flex-1 sm:flex-none h-10 text-red-400 hover:bg-red-500/10 border-red-500/10 px-4">
                        <X size={16} className="mr-2" />
                        Reject
                      </Button>
                      <Button onClick={() => handleApprove(selectedRequest.user.id)} className="flex-1 sm:flex-none h-10 px-6">
                        <Check size={16} className="mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Visual Comparison */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Identity Comparison</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 block">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-blue-500 text-center uppercase tracking-widest">Aadhaar Face</p>
                          <div className="aspect-square rounded-2xl bg-slate-900 border border-white/5 overflow-hidden relative">
                             <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                               <User size={32} />
                             </div>
                             {selectedRequest.documents?.aadhaar_face_path && (
                               <img 
                                src={`${import.meta.env.VITE_UPLOAD_URL}${selectedRequest.documents.aadhaar_face_path}`} 
                                alt="Aadhaar Face" 
                                className="w-full h-full object-cover relative z-10"
                                onError={(e) => e.target.style.display = 'none'}
                               />
                             )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-blue-500 text-center uppercase tracking-widest">Live Selfie</p>
                          <div className="aspect-square rounded-2xl bg-slate-900 border border-white/5 overflow-hidden relative">
                             <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                               <Camera size={32} />
                             </div>
                             {selectedRequest.documents?.selfie_path && (
                               <img 
                                src={`${import.meta.env.VITE_UPLOAD_URL}${selectedRequest.documents.selfie_path}`} 
                                alt="Selfie" 
                                className="w-full h-full object-cover relative z-10"
                                onError={(e) => e.target.style.display = 'none'}
                               />
                             )}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`mt-4 p-4 rounded-2xl border text-center space-y-1 ${
                        selectedRequest.face?.match_status ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
                      }`}>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Similarity Score</p>
                         <p className={`text-2xl font-display font-bold ${selectedRequest.face?.match_status ? "text-green-500" : "text-red-500"}`}>
                           {Math.round((selectedRequest.face?.similarity_score || 0) * 100)}%
                         </p>
                      </div>
                    </div>

                    {/* Data Details */}
                    <div className="space-y-6">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Application Metadata</p>
                       <div className="space-y-4">
                          <DetailRow label="Extracted Name" value={selectedRequest.ocr?.name} />
                          <DetailRow label="Matched With" value={`${selectedRequest.user.first_name} ${selectedRequest.user.last_name}`} />
                          <DetailRow label="DOB / Gender" value={`${selectedRequest.ocr?.dob} — ${selectedRequest.ocr?.gender}`} />
                          <DetailRow label="Aadhaar No." value={selectedRequest.ocr?.aadhaar_number} isMono />
                          <div className="flex items-center gap-3 pt-2">
                             <div className={`w-3 h-3 rounded-full ${selectedRequest.liveness?.status ? "bg-green-500" : "bg-red-500"}`} />
                             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Liveness Detection: {selectedRequest.liveness?.status ? "PASSED" : "FAILED"}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 opacity-30 select-none">
                <Shield size={48} className="text-slate-500" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Select a submission to review details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md"
            >
              <Card className="border-red-500/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-red-500 font-display font-bold">
                    <ShieldX size={32} />
                    <h4 className="text-xl">Reject KYC Request</h4>
                  </div>
                  <p className="text-sm text-slate-400">Please provide a reason for rejection. This will be visible to the user.</p>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rejection Reason</label>
                    <textarea 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Aadhaar image is too blurry..."
                      className="w-full h-32 bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-slate-100 placeholder:text-slate-700 outline-none focus:border-red-500/50 transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button onClick={() => setShowRejectModal(false)} variant="secondary" className="flex-1">Cancel</Button>
                    <Button onClick={handleReject} variant="primary" className="flex-[2] bg-red-600 hover:bg-red-500">Confirm Rejection</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, bg }) {
  return (
    <Card className="p-5 flex items-center gap-5 border-white/5 bg-slate-900/40 group hover:border-blue-500/20 transition-all duration-300">
      <div className={`p-3 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          <span className={`text-[8px] font-bold ${trend.startsWith('+') ? 'text-green-500' : trend === 'Optimal' ? 'text-blue-400' : 'text-amber-500'}`}>
            {trend}
          </span>
        </div>
        <p className="text-2xl font-display font-bold text-white tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

function ActivityItem({ user, action, time, status }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-colors">
      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${status === 'VERIFIED' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
      <div className="space-y-0.5">
        <p className="text-[11px] text-white">
          <span className="font-bold">{user}</span> {action}
        </p>
        <div className="flex items-center gap-2 text-[9px] text-slate-600 font-medium">
          <Clock size={10} /> {time}
        </div>
      </div>
      <ArrowUpRight size={12} className="ml-auto text-slate-700 group-hover:text-slate-400 transition-colors" />
    </div>
  );
}

function DetailRow({ label, value, isMono }) {
  return (
    <div className="space-y-1 group">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-500/70 transition-colors">{label}</p>
      <p className={`text-sm text-slate-100 ${isMono ? "font-mono" : "font-semibold"}`}>{value || 'N/A'}</p>
    </div>
  );
}
