import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import {
  LifeBuoy,
  PlusCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  Radio,
  Search,
} from "lucide-react";

export default function Navbar({ onOpenCreateModal }) {
  const { user, role, isAuthenticated, isAgent, isCustomer, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <LifeBuoy className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  HelpDesk<span className="text-brand-400">Pro</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block -mt-1">
                  Support Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                isCustomer ? (
                  <>
                    <Link
                      to="/customer/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/customer/dashboard")
                          ? "bg-slate-800 text-brand-400"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      My Tickets
                    </Link>
                  </>
                ) : isAgent ? (
                  <>
                    <Link
                      to="/agent/dashboard"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/agent/dashboard")
                          ? "bg-slate-800 text-brand-400"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/agent/queue"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/agent/queue")
                          ? "bg-slate-800 text-brand-400"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <Inbox className="w-4 h-4" />
                      All Tickets Queue
                    </Link>
                  </>
                ) : null
              ) : (
                <Link
                  to="/"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
                >
                  Overview
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {/* Live Socket Status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
              title={isConnected ? "Real-time socket active" : "Reconnecting socket..."}
            >
              <Radio className={`w-3 h-3 ${isConnected ? "animate-pulse" : ""}`} />
              <span>{isConnected ? "Live" : "Offline"}</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isCustomer && onOpenCreateModal && (
                  <button
                    onClick={onOpenCreateModal}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-600/30 transition-all hover:scale-105"
                  >
                    <PlusCircle className="w-4 h-4" />
                    New Ticket
                  </button>
                )}

                {/* Role & User Badge */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isAgent
                          ? "bg-purple-600 text-purple-100"
                          : "bg-slate-700 text-slate-200"
                      }`}
                    >
                      {isAgent ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="text-left leading-tight">
                      <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {user?.name || user?.email}
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          isAgent ? "text-purple-400" : "text-brand-400"
                        }`}
                      >
                        {isAgent ? "Support Agent" : "Customer"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-600/30 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-6 space-y-3 animate-slide-up">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    isAgent ? "bg-purple-600 text-white" : "bg-slate-700 text-white"
                  }`}
                >
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{user?.name}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                  <span className="text-[10px] font-bold uppercase text-brand-400">
                    {role}
                  </span>
                </div>
              </div>

              {isCustomer && onOpenCreateModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCreateModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 text-white font-medium text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Ticket
                </button>
              )}

              <nav className="space-y-1">
                {isCustomer ? (
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
                  >
                    My Tickets
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/agent/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Agent Dashboard
                    </Link>
                    <Link
                      to="/agent/queue"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
                    >
                      All Tickets Queue
                    </Link>
                  </>
                )}
              </nav>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl bg-brand-600 text-sm font-medium text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
