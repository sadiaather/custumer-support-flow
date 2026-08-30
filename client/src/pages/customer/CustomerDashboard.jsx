import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { ticketApi } from "../../api/client";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import StatsCard from "../../components/dashboard/StatsCard";
import TicketFilters from "../../components/dashboard/TicketFilters";
import TicketCard from "../../components/tickets/TicketCard";
import CreateTicketModal from "../../components/tickets/CreateTicketModal";
import {
  Ticket,
  Clock,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  FolderOpen,
  HelpCircle,
} from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { error } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchTickets = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      const res = await ticketApi.getMyTickets();
      setTickets(res.data.tickets || []);
    } catch (err) {
      error(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Socket listener for real-time ticket status changes
  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (newTicket) => {
      // Check if this ticket belongs to the current customer
      const isMyTicket =
        newTicket.customer === user?.id ||
        newTicket.customer?._id === user?.id;
      if (isMyTicket) {
        setTickets((prev) => {
          if (prev.some((t) => t._id === newTicket._id)) return prev;
          return [newTicket, ...prev];
        });
      }
    };

    const handleTicketUpdated = (updatedTicket) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
      );
    };

    socket.on("ticketCreated", handleTicketCreated);
    socket.on("ticketUpdated", handleTicketUpdated);

    return () => {
      socket.off("ticketCreated", handleTicketCreated);
      socket.off("ticketUpdated", handleTicketUpdated);
    };
  }, [socket, user]);

  // Derived Stats
  const totalCount = tickets.length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "New" || t.status === "Assigned" || t.status === "In Progress"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search
      const searchMatch =
        !searchTerm.trim() ||
        ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());

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
  }, [tickets, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Support Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-200">{user?.name}</strong>. Track your submitted tickets and live agent chats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTickets(false)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-brand-400" : ""}`} />
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ticket</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Tickets"
          value={totalCount}
          subtitle="All tickets submitted"
          icon={Ticket}
          color="brand"
        />
        <StatsCard
          title="Active / In Progress"
          value={inProgressCount}
          subtitle="Awaiting resolution"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Closed successfully"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Filter Component */}
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

      {/* Ticket List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-brand-400" />
            My Tickets ({filteredTickets.length})
          </h2>
          {filteredTickets.length !== tickets.length && (
            <span className="text-xs text-slate-400">
              Showing {filteredTickets.length} of {tickets.length} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Fetching your tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="glass-panel py-16 px-4 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Tickets Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {tickets.length === 0
                  ? "You haven't submitted any support tickets yet. Click the button below to get assistance."
                  : "No tickets match your filter criteria. Try adjusting your search or filters."}
              </p>
            </div>
            {tickets.length === 0 && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Your First Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                isAgent={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTicketCreated={(newTkt) => {
          setTickets((prev) => [newTkt, ...prev]);
        }}
      />
    </div>
  );
}
