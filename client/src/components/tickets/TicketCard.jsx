import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import PriorityBadge from "../common/PriorityBadge";
import { MessageSquare, User, ShieldCheck, Clock, ArrowRight, CheckCircle } from "lucide-react";

export default function TicketCard({
  ticket,
  isAgent = false,
  onClaim,
  onUpdateStatus,
  currentAgentId,
}) {
  const isAssignedToCurrentAgent =
    isAgent && ticket.agent && (ticket.agent._id === currentAgentId || ticket.agent === currentAgentId);
  const isUnassigned = !ticket.agent;

  const detailUrl = isAgent
    ? `/agent/ticket/${ticket._id}`
    : `/customer/ticket/${ticket._id}`;

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4">
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              {ticket.ticketNumber}
            </span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-medium">
              {ticket.category || "General"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority || "Medium"} size="sm" />
            <StatusBadge status={ticket.status} size="sm" />
          </div>
        </div>

        <Link
          to={detailUrl}
          className="block group"
        >
          <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
            {ticket.subject}
          </h3>
        </Link>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {ticket.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {/* Customer / Agent indicator */}
          {isAgent ? (
            <div className="flex items-center gap-1 text-slate-300" title="Customer">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{ticket.customer?.name || "Customer"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1" title="Assigned Agent">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className={ticket.agent ? "text-purple-300 font-medium" : "text-slate-500 italic"}>
                {ticket.agent?.name ? ticket.agent.name : "Unassigned"}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {isAgent && isUnassigned && onClaim && ticket.status !== "Resolved" && (
            <button
              onClick={() => onClaim(ticket)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Claim
            </button>
          )}

          {isAgent && isAssignedToCurrentAgent && onUpdateStatus && ticket.status !== "Resolved" && (
            <button
              onClick={() => onUpdateStatus(ticket)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Update Status
            </button>
          )}

          <Link
            to={detailUrl}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all hover:scale-105"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>View & Chat</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
