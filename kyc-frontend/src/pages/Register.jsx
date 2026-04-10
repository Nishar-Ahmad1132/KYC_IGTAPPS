import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useState } from "react";
import { useKycStore } from "../app/store";
import api from "../services/api";
import { Mail, Phone, User, CreditCard, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import ProgressBar from "../components/ui/ProgressBar";

const registerSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken } = useKycStore();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ 
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) 
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    try {
      const endpoint = isLogin ? "/users/login" : "/users/register";
      const res = await api.post(endpoint, data);
      
      if (isLogin) {
        // Login returns token and user info
        setToken(res.data.access_token);
        // Fetch full profile info for storage
        const profileRes = await api.get("/users/me");
        setUser(profileRes.data);
        
        if (res.data.is_admin) {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Registration successful -> Switch to login
        alert("Registration successful! Please login.");
        setIsLogin(true);
        reset();
      }
    } catch (err) {
      setServerError(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full space-y-10 py-4">
      {/* Header Section */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white">
          {isLogin ? "Welcome" : "Create"} <span className="text-blue-500">{isLogin ? "Back." : "Identity."}</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
          {isLogin 
            ? "Sign in to access your secure KYC dashboard." 
            : "Begin your secure verification process. It only takes a few minutes."}
        </p>
      </div>

      <Card className="shadow-2xl shadow-blue-500/5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                icon={User}
                placeholder="John"
                error={errors.first_name}
                register={register("first_name")}
              />
              <InputField
                label="Last Name"
                icon={User}
                placeholder="Doe"
                error={errors.last_name}
                register={register("last_name")}
              />
            </div>
          )}

          <InputField
            label="Email Address"
            icon={Mail}
            placeholder="john@example.com"
            error={errors.email}
            register={register("email")}
          />

          {!isLogin && (
            <>
              <InputField
                label="Mobile Number"
                icon={Phone}
                placeholder="9876543210"
                error={errors.mobile}
                register={register("mobile")}
              />
              <InputField
                label="PAN Number"
                icon={CreditCard}
                placeholder="ABCDE1234F"
                error={errors.pan_number}
                register={register("pan_number")}
                uppercase
              />
            </>
          )}

          <div className="relative">
            <InputField
              label="Password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.password}
              register={register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-slate-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {serverError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
              {serverError}
            </div>
          )}

          <div className="pt-2">
            <Button 
              type="submit" 
              loading={loading} 
              className="w-full h-14 text-base"
            >
              {isLogin ? "Sign In" : "Register Now"}
              <ArrowRight size={18} className="ml-1" />
            </Button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                reset();
                setServerError("");
              }}
              className="text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors"
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </Card>

      {/* Trust Footer */}
      <div className="flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">JWT</div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Secured</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">AES</div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Encrypt</span>
        </div>
      </div>
    </div>
  );
}
