import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ticketApi } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import TicketChat from "../../components/tickets/TicketChat";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  Tag,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function CustomerTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { error } = useToast();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await ticketApi.getSingleTicket(id);
      setTicket(res.data.ticket);
    } catch (err) {
      error(err.message || "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  // Socket listener for real-time ticket updates (e.g. agent claimed or status updated)
  useEffect(() => {
    if (!socket || !id) return;

    const handleTicketUpdated = (updated) => {
      if (updated._id === id) {
        setTicket(updated);
      }
    };

    socket.on("ticketUpdated", handleTicketUpdated);

    return () => {
      socket.off("ticketUpdated", handleTicketUpdated);
    };
  }, [socket, id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested ticket does not exist or you do not have permission to view it.
        </p>
        <Link
          to="/customer/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Tickets
        </Link>
      </div>
    );
  }

  const steps = ["New", "Assigned", "In Progress", "Resolved"];
  const currentStepIndex = steps.indexOf(ticket.status);

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} size="lg" />
        </div>
      </div>

      {/* Status Progress Stepper */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  } ${isCurrent ? "ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-950" : ""}`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold tracking-tight ${
                    isCompleted ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Ticket Details (Left) + Live Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket Details Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Header Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded border border-brand-500/20">
                {ticket.ticketNumber}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded font-medium">
                {ticket.category}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white leading-snug">
                {ticket.subject}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created on {formattedDate}</span>
            </div>
          </div>

          {/* Assigned Agent Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Assigned Specialist
            </h4>

            {ticket.agent ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                  {ticket.agent.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {ticket.agent.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {ticket.agent.email}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">
                    Active on this ticket
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <Clock className="w-5 h-5 text-amber-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">
                  Waiting for Agent Assignment
                </p>
                <p className="text-[11px] text-slate-500">
                  Your ticket is in the triage queue and will be claimed shortly.
                </p>
              </div>
            )}
          </div>

          {/* Resolution Note if Resolved */}
          {ticket.status === "Resolved" && ticket.resolutionNote && (
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-2 animate-slide-up">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Official Resolution Note
              </div>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-purple-800/30">
                {ticket.resolutionNote}
              </p>
            </div>
          )}
        </div>

        {/* Live Chat Column (7 cols) */}
        <div className="lg:col-span-7">
          <TicketChat
            ticketId={ticket._id}
            currentUserId={user?.id}
            isAgent={false}
            ticketStatus={ticket.status}
          />
        </div>
      </div>
    </div>
  );
}
