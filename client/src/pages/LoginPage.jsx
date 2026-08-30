import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { User, ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "agent" ? "agent" : "customer";
  const [activeTab, setActiveTab] = useState(initialRole); // 'customer' or 'agent'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginCustomer, loginAgent } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      if (activeTab === "customer") {
        await loginCustomer(email.trim(), password);
        success("Welcome back! Customer login successful.");
        navigate("/customer/dashboard");
      } else {
        await loginAgent(email.trim(), password);
        success("Welcome back! Agent workspace loaded.");
        navigate("/agent/dashboard");
      }
    } catch (err) {
      error(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAgent = () => {
    setActiveTab("agent");
    setEmail("agent@test.com");
    setPassword("123456");
  };

  const handleFillDemoCustomer = () => {
    setActiveTab("customer");
    setEmail("customer@test.com");
    setPassword("123456");
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-400">
            Access your support dashboard, view tickets, and chat in real time.
          </p>
        </div>

        {/* Tab Switcher: Customer vs Agent */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab("customer");
              setEmail("");
              setPassword("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "customer"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            Customer Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("agent");
              setEmail("");
              setPassword("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "agent"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Support Agent
          </button>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          {/* Demo Quick Fill Hint */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Fill:
            </span>
            {activeTab === "agent" ? (
              <button
                type="button"
                onClick={handleFillDemoAgent}
                className="text-purple-400 hover:underline font-bold"
              >
                Agent (agent@test.com)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFillDemoCustomer}
                className="text-brand-400 hover:underline font-bold"
              >
                Fill Customer
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === "agent" ? "agent@test.com" : "customer@example.com"
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 ${
                activeTab === "agent"
                  ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
                  : "bg-brand-600 hover:bg-brand-500 shadow-brand-600/30"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as {activeTab === "agent" ? "Agent" : "Customer"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Don't have an account yet?{" "}
          <Link
            to={`/register?role=${activeTab}`}
            className="text-brand-400 hover:underline font-semibold"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
