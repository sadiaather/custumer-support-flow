import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketApi } from "../api/client";
import { useToast } from "../context/ToastContext";
import StatusBadge from "../components/common/StatusBadge";
import PriorityBadge from "../components/common/PriorityBadge";
import {
  LifeBuoy,
  ShieldCheck,
  Zap,
  MessageSquare,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Clock,
  Headphones,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, isAgent, isCustomer, loginAgent } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Public Ticket Lookup
  const [lookupNumber, setLookupNumber] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookedUpTicket, setLookedUpTicket] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupNumber.trim()) return;

    try {
      setLookupLoading(true);
      setLookedUpTicket(null);
      const res = await ticketApi.getAllTickets();
      const all = res.data.tickets || [];
      const found = all.find(
        (t) =>
          t.ticketNumber?.toLowerCase() === lookupNumber.trim().toLowerCase() ||
          t._id === lookupNumber.trim()
      );

      if (found) {
        setLookedUpTicket(found);
        success(`Ticket ${found.ticketNumber} found!`);
      } else {
        error("No ticket found with that ticket number.");
      }
    } catch (err) {
      error("Lookup failed. Please check the ticket number.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleQuickAgentLogin = async () => {
    try {
      await loginAgent("agent@test.com", "123456");
      success("Logged in as Support Agent!");
      navigate("/agent/dashboard");
    } catch (err) {
      error(err.message || "Agent login failed");
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-600/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Real-Time Support Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Resolve Customer Issues <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-cyan-300 to-blue-500">
              Faster with Live Intelligence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            A comprehensive customer support desk with real-time live chat, agent dispatching,
            automated ticket tracking, and multi-tier role authentication.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Link
                to={isAgent ? "/agent/dashboard" : "/customer/dashboard"}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-105"
              >
                <span>Go to Your {isAgent ? "Agent Workspace" : "Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-105"
                >
                  <Users className="w-4 h-4" />
                  <span>Customer Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleQuickAgentLogin}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold text-sm transition-all hover:scale-105"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>1-Click Agent Demo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Live Ticket Lookup Tool */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl relative">
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-brand-400" />
              Track Any Ticket Status
            </h3>
            <p className="text-xs text-slate-400">
              Enter your Ticket Number (e.g. <span className="font-mono text-brand-300">TKT-...</span>) to instantly check live progress.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={lookupNumber}
                onChange={(e) => setLookupNumber(e.target.value)}
                placeholder="Enter Ticket Number..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={lookupLoading}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-md shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {lookupLoading ? "Searching..." : "Track Status"}
            </button>
          </form>

          {lookedUpTicket && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded border border-brand-500/20">
                  {lookedUpTicket.ticketNumber}
                </span>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={lookedUpTicket.priority} size="sm" />
                  <StatusBadge status={lookedUpTicket.status} size="sm" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-base">{lookedUpTicket.subject}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{lookedUpTicket.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>
                    Agent:{" "}
                    <strong className="text-slate-200">
                      {lookedUpTicket.agent?.name || "Unassigned (In Triage Queue)"}
                    </strong>
                  </span>
                </div>
                {isAuthenticated ? (
                  <Link
                    to={
                      isAgent
                        ? `/agent/ticket/${lookedUpTicket._id}`
                        : `/customer/ticket/${lookedUpTicket._id}`
                    }
                    className="text-brand-400 hover:underline font-semibold"
                  >
                    Open Live Chat &rarr;
                  </Link>
                ) : (
                  <Link to="/login" className="text-brand-400 hover:underline font-semibold">
                    Sign in to Chat &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Engineered for High-Speed Support
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything your customers and support agents need to communicate without friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Messaging</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by Socket.IO for instant two-way communication between customers and agents with zero page reload delays.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Agent Dispatch & Claim</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Support agents can monitor the global incoming queue, claim tickets with one click, and manage their assigned workloads.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Audit Resolution Notes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mandatory resolution notes upon ticket closure ensure clear communication and documented solutions for every case.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Portals Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-brand-400">
                <Users className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Customer Portal</span>
              </div>
              <h3 className="text-xl font-bold text-white">Need Support?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit tickets for billing, technical bugs, or account inquiries. Track status in real time.
              </p>
            </div>
            <Link
              to="/login?role=customer"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-brand-400 text-sm font-semibold border border-slate-700/60"
            >
              <span>Customer Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-400">
                <Headphones className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Support Agent Portal</span>
              </div>
              <h3 className="text-xl font-bold text-white">Support Specialist?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in to access your triage dashboard, claim tickets from the queue, and chat with customers.
              </p>
            </div>
            <Link
              to="/login?role=agent"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 text-sm font-semibold border border-purple-500/30"
            >
              <span>Agent Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
