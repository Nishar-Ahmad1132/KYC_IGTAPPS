import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useKycStore } from "./store";

import Landing from "../pages/Landing";
import Register from "../pages/Register";
import AadhaarUpload from "../pages/AadhaarUpload";
import OCRReview from "../pages/OCRReview";
import SelfieCapture from "../pages/SelfieCapture";
import LivenessCheck from "../pages/LivenessCheck";
import VerificationResult from "../pages/VerificationResult";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useKycStore();
  
  if (!token) return <Navigate to="/" replace />;
  if (adminOnly && !user?.is_admin) return <Navigate to="/dashboard" replace />;
  
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public / Landing */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/aadhaar" element={<ProtectedRoute><AadhaarUpload /></ProtectedRoute>} />
        <Route path="/ocr-review" element={<ProtectedRoute><OCRReview /></ProtectedRoute>} />
        <Route path="/selfie" element={<ProtectedRoute><SelfieCapture /></ProtectedRoute>} />
        <Route path="/liveness" element={<ProtectedRoute><LivenessCheck /></ProtectedRoute>} />
        <Route path="/verification" element={<ProtectedRoute><VerificationResult /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
