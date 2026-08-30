import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ticketApi } from "../../api/client";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import TicketFilters from "../../components/dashboard/TicketFilters";
import TicketCard from "../../components/tickets/TicketCard";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import {
  Inbox,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function AgentTicketQueue() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { success, error } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  // Queue View Tab
  const [queueTab, setQueueTab] = useState("all"); // 'all', 'unassigned', 'assigned'

  // Status modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchTickets = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const res = await ticketApi.getAllTickets();
      setTickets(res.data.tickets || []);
    } catch (err) {
      error(err.message || "Failed to load global ticket queue");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Socket listener for real-time ticket creation & assignment
  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (newTkt) => {
      setTickets((prev) => [newTkt, ...prev]);
    };

    const handleTicketUpdated = (updatedTkt) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updatedTkt._id ? updatedTkt : t))
      );
    };

    socket.on("ticketCreated", handleTicketCreated);
    socket.on("ticketUpdated", handleTicketUpdated);

    return () => {
      socket.off("ticketCreated", handleTicketCreated);
      socket.off("ticketUpdated", handleTicketUpdated);
    };
  }, [socket]);

  // Claim Ticket Handler
  const handleClaimTicket = async (ticket) => {
    try {
      setClaimingId(ticket._id);
      const res = await ticketApi.assignTicket(ticket._id, user?.id);
      success(`Ticket ${ticket.ticketNumber} successfully assigned to you!`);
      const updated = res.data.ticket;
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
    } catch (err) {
      error(err.message || "Failed to claim ticket");
    } finally {
      setClaimingId(null);
    }
  };

  const handleOpenStatusModal = (ticket) => {
    setSelectedTicket(ticket);
    setStatusModalOpen(true);
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Queue tab filter
      if (queueTab === "unassigned" && ticket.agent) return false;
      if (queueTab === "assigned" && !ticket.agent) return false;

      // Search
      const searchMatch =
        !searchTerm.trim() ||
        ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status
      const statusMatch =
        statusFilter === "All" || ticket.status === statusFilter;

      // Category
      const categoryMatch =
        categoryFilter === "All" || ticket.category === categoryFilter;

      // Priority
      const priorityMatch =
        priorityFilter === "All" || ticket.priority === priorityFilter;

      return searchMatch && statusMatch && categoryMatch && priorityMatch;
    });
  }, [tickets, queueTab, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const unassignedCount = tickets.filter((t) => !t.agent && t.status !== "Resolved").length;
  const assignedCount = tickets.filter((t) => !!t.agent).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/agent/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Global Ticket Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            System-wide tickets feed. Claim incoming customer issues or inspect triage status.
          </p>
        </div>

        <button
          onClick={() => fetchTickets(false)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-sm font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Queue Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setQueueTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            queueTab === "all"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Tickets ({tickets.length})</span>
        </button>

        <button
          onClick={() => setQueueTab("unassigned")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            queueTab === "unassigned"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Unassigned ({unassignedCount})</span>
        </button>

        <button
          onClick={() => setQueueTab("assigned")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            queueTab === "assigned"
              ? "bg-slate-800 text-purple-300 border border-purple-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Assigned ({assignedCount})</span>
        </button>
      </div>

      {/* Filters */}
      <TicketFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      {/* Ticket Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Inbox className="w-4 h-4 text-purple-400" />
            Showing {filteredTickets.length} tickets
          </h2>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Fetching global queue...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="glass-panel py-16 px-4 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Tickets in this Queue</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No tickets match your active filter settings.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                isAgent={true}
                currentAgentId={user?.id}
                onClaim={handleClaimTicket}
                onUpdateStatus={handleOpenStatusModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onStatusUpdated={(updated) => {
          setTickets((prev) =>
            prev.map((t) => (t._id === updated._id ? updated : t))
          );
        }}
      />
    </div>
  );
}
