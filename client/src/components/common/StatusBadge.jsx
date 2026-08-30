import React from "react";

const statusConfig = {
  New: {
    bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400 animate-pulse",
    label: "New",
  },
  Assigned: {
    bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
    label: "Assigned",
  },
  "In Progress": {
    bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400 animate-pulse",
    label: "In Progress",
  },
  Resolved: {
    bg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    dot: "bg-purple-400",
    label: "Resolved",
  },
};

export default function StatusBadge({ status = "New", size = "md", className = "" }) {
  const config = statusConfig[status] || statusConfig["New"];
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3 py-1.5 text-sm font-medium",
  }[size] || "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
