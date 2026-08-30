import React, { useState } from "react";
import Modal from "../common/Modal";
import { ticketApi } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Send, AlertCircle, Tag, Flag } from "lucide-react";

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const { success, error } = useToast();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      error("Please fill in both subject and description");
      return;
    }

    try {
      setLoading(true);
      const res = await ticketApi.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });

      success("Ticket created successfully! Our team will assist you shortly.");
      setSubject("");
      setDescription("");
      setCategory("Technical");
      setPriority("Medium");
      onClose();

      if (onTicketCreated) {
        onTicketCreated(res.data.ticket);
      }
    } catch (err) {
      error(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Support Ticket" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Cannot access billing invoice for October"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-brand-400" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="Technical">Technical Issue</option>
              <option value="Billing">Billing & Payments</option>
              <option value="Account">Account Security</option>
              <option value="Shipping">Shipping & Orders</option>
              <option value="Other">General / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="Low">Low - Minor question</option>
              <option value="Medium">Medium - Normal issue</option>
              <option value="High">High - Urgent / Blocked</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Detailed Description *
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe what happened, steps to reproduce, or any relevant details..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-lg shadow-brand-600/30 transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{loading ? "Submitting..." : "Submit Ticket"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
