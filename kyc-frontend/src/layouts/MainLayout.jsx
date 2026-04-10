import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link, Outlet, useNavigate } from "react-router-dom";
import { Shield, User, Bell, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useKycStore } from "../app/store";

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useKycStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-600/20">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              KYC<span className="text-blue-500">PORTAL</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-8">
            {user && (
              <div className="flex items-center gap-6">
                {/* Regular Dashboard Link */}
                <Link 
                  to="/dashboard" 
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${location.pathname === '/dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Dashboard
                </Link>

                {/* Conditional Admin Panel Link */}
                {user.is_admin && (
                  <Link 
                    to="/admin-dashboard" 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                      location.pathname === '/admin-dashboard' 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                        : 'border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Settings size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Admin Panel</span>
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white leading-none">{user.first_name} {user.last_name}</span>
                    <span className="text-[9px] font-medium text-slate-500 leading-tight">{user.is_admin ? "Administrator" : "User Profile"}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-400 hover:text-white transition">
                    <Bell size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition">
                    <User size={20} />
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 flex flex-col">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-8 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
          <p>© 2026 Index Global Technology Pvt Ltd.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
