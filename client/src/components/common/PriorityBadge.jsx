import React from "react";
import { AlertCircle, AlertTriangle, ArrowDown } from "lucide-react";

const priorityConfig = {
  High: {
    bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    icon: AlertCircle,
    label: "High Priority",
  },
  Medium: {
    bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: AlertTriangle,
    label: "Medium Priority",
  },
  Low: {
    bg: "bg-slate-500/10 text-slate-300 border-slate-500/30",
    icon: ArrowDown,
    label: "Low Priority",
  },
};

export default function PriorityBadge({ priority = "Medium", showIcon = true, size = "md", className = "" }) {
  const config = priorityConfig[priority] || priorityConfig["Medium"];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-medium",
  }[size] || "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${config.bg} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
}
