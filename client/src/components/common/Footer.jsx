import React from "react";
import { LifeBuoy, Heart, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-850 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-slate-300">HelpDesk Pro</span>
          <span>&copy; {new Date().getFullYear()} Customer Support Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            JWT Role Authentication
          </span>
          <span className="flex items-center gap-1">
            Real-time Socket.IO Active
          </span>
        </div>
      </div>
    </footer>
  );
}
