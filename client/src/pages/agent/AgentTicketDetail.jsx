import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ticketApi } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import TicketChat from "../../components/tickets/TicketChat";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Edit3,
} from "lucide-react";

export default function AgentTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      // Retrieve from all tickets
      const res = await ticketApi.getAllTickets();
      const all = res.data.tickets || [];
      const found = all.find((t) => t._id === id || t.ticketNumber === id);
      if (found) {
        setTicket(found);
      } else {
        error("Ticket not found");
      }
    } catch (err) {
      error(err.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  // Real-time socket updates
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

  const handleClaim = async () => {
    if (!ticket) return;
    try {
      setClaiming(true);
      const res = await ticketApi.assignTicket(ticket._id, user?.id);
      success("Ticket successfully claimed and assigned to you!");
      setTicket(res.data.ticket);
    } catch (err) {
      error(err.message || "Failed to claim ticket");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading ticket workspace...</p>
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
          The requested ticket does not exist or has been removed.
        </p>
        <Link
          to="/agent/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agent Dashboard
        </Link>
      </div>
    );
  }

  const isAssignedToMe =
    ticket.agent &&
    (ticket.agent._id === user?.id || ticket.agent === user?.id);
  const isUnassigned = !ticket.agent;

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
      {/* Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/agent/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>

        <div className="flex items-center gap-3">
          {isUnassigned && ticket.status !== "Resolved" && (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>{claiming ? "Claiming..." : "Claim / Assign to Me"}</span>
            </button>
          )}

          {isAssignedToMe && ticket.status !== "Resolved" && (
            <button
              onClick={() => setStatusModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Status</span>
            </button>
          )}

          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} size="lg" />
        </div>
      </div>

      {/* Stepper */}
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
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  } ${isCurrent ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-950" : ""}`}
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

      {/* Layout Grid: Ticket Info & Customer (Left 5 cols) + Realtime Chat (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Metadata Card */}
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
              <span>Submitted on {formattedDate}</span>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-400" />
              Customer Information
            </h4>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-sm">
                {ticket.customer?.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {ticket.customer?.name || "Customer"}
                </div>
                <div className="text-xs text-slate-400">
                  {ticket.customer?.email || "No email available"}
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Note if resolved */}
          {ticket.status === "Resolved" && ticket.resolutionNote && (
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-2 animate-slide-up">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Recorded Resolution Note
              </div>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-purple-800/30">
                {ticket.resolutionNote}
              </p>
            </div>
          )}
        </div>

        {/* Live Chat Column */}
        <div className="lg:col-span-7">
          {isAssignedToMe ? (
            <TicketChat
              ticketId={ticket._id}
              currentUserId={user?.id}
              isAgent={true}
              ticketStatus={ticket.status}
            />
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center h-[560px] space-y-4 bg-slate-950/60">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-white">
                  Ticket Not Assigned to You
                </h3>
                <p className="text-xs text-slate-400">
                  {isUnassigned
                    ? "Claim this ticket above to start a live support conversation with the customer."
                    : `This ticket is currently assigned to ${ticket.agent?.name || "another agent"}.`}
                </p>
              </div>
              {isUnassigned && ticket.status !== "Resolved" && (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30"
                >
                  {claiming ? "Claiming..." : "Claim Ticket Now"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        ticket={ticket}
        onStatusUpdated={(updated) => setTicket(updated)}
      />
    </div>
  );
}
