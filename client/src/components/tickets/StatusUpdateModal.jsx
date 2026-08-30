import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { ticketApi } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function StatusUpdateModal({ isOpen, onClose, ticket, onStatusUpdated }) {
  const { success, error } = useToast();
  const [status, setStatus] = useState("In Progress");
  const [resolutionNote, setResolutionNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || "In Progress");
      setResolutionNote(ticket.resolutionNote || "");
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === "Resolved" && !resolutionNote.trim()) {
      error("A resolution note is required when resolving a ticket.");
      return;
    }

    try {
      setLoading(true);
      const res = await ticketApi.updateStatus(ticket._id, {
        status,
        resolutionNote: status === "Resolved" ? resolutionNote.trim() : undefined,
      });

      success(`Ticket status updated to "${status}"`);
      onClose();

      if (onStatusUpdated) {
        onStatusUpdated(res.data.ticket);
      }
    } catch (err) {
      error(err.message || "Failed to update ticket status");
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { value: "New", label: "New (Pending Triage)" },
    { value: "Assigned", label: "Assigned" },
    { value: "In Progress", label: "In Progress (Working)" },
    { value: "Resolved", label: "Resolved (Close Ticket)" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Status: ${ticket.ticketNumber}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Ticket Subject
          </label>
          <p className="text-sm font-medium text-white bg-slate-950 p-3 rounded-xl border border-slate-800">
            {ticket.subject}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            New Status *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-500"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {status === "Resolved" && (
          <div className="space-y-1.5 animate-slide-up">
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Resolution Note * (Required for closing ticket)
            </label>
            <textarea
              required
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Explain how the issue was resolved or steps taken..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors resize-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-lg shadow-brand-600/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{loading ? "Updating..." : "Save Status"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
