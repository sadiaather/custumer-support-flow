import React from "react";

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "brand", onClick }) {
  const colorStyles = {
    brand: "from-brand-500/20 to-brand-500/5 text-brand-400 border-brand-500/30",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30",
  }[color] || "from-slate-800 to-slate-900 text-slate-300 border-slate-700";

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 ${colorStyles} ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h4 className="text-3xl font-extrabold text-white mt-1">
            {value}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
