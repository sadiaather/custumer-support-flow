import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { agentApi, ticketApi } from "../../api/client";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import StatsCard from "../../components/dashboard/StatsCard";
import TicketFilters from "../../components/dashboard/TicketFilters";
import TicketCard from "../../components/tickets/TicketCard";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import {
  ShieldCheck,
  Inbox,
  Clock,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  ListFilter,
} from "lucide-react";

export default function AgentDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { success, error } = useToast();

  const [myTickets, setMyTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const [dashRes, allRes] = await Promise.all([
        agentApi.getDashboard(),
        ticketApi.getAllTickets(),
      ]);

      setMyTickets(dashRes.data.tickets || []);
      setAllTickets(allRes.data.tickets || []);
    } catch (err) {
      error(err.message || "Failed to load agent dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Socket listener for real-time ticket updates
  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (newTkt) => {
      setAllTickets((prev) => [newTkt, ...prev]);
    };

    const handleTicketUpdated = (updatedTkt) => {
      setAllTickets((prev) =>
        prev.map((t) => (t._id === updatedTkt._id ? updatedTkt : t))
      );

      // Check if assigned to current agent
      const isAssignedToMe =
        updatedTkt.agent === user?.id ||
        updatedTkt.agent?._id === user?.id;

      setMyTickets((prev) => {
        const exists = prev.some((t) => t._id === updatedTkt._id);
        if (isAssignedToMe) {
          if (exists) {
            return prev.map((t) => (t._id === updatedTkt._id ? updatedTkt : t));
          } else {
            return [updatedTkt, ...prev];
          }
        } else {
          return prev.filter((t) => t._id !== updatedTkt._id);
        }
      });
    };

    socket.on("ticketCreated", handleTicketCreated);
    socket.on("ticketUpdated", handleTicketUpdated);

    return () => {
      socket.off("ticketCreated", handleTicketCreated);
      socket.off("ticketUpdated", handleTicketUpdated);
    };
  }, [socket, user]);

  // Stats calculation
  const myAssignedCount = myTickets.length;
  const unassignedCount = allTickets.filter(
    (t) => !t.agent && t.status !== "Resolved"
  ).length;
  const resolvedByMeCount = myTickets.filter(
    (t) => t.status === "Resolved"
  ).length;

  const handleOpenStatusModal = (ticket) => {
    setSelectedTicket(ticket);
    setStatusModalOpen(true);
  };

  // Filter my tickets
  const filteredMyTickets = useMemo(() => {
    return myTickets.filter((ticket) => {
      const searchMatch =
        !searchTerm.trim() ||
        ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        statusFilter === "All" || ticket.status === statusFilter;
      const categoryMatch =
        categoryFilter === "All" || ticket.category === categoryFilter;
      const priorityMatch =
        priorityFilter === "All" || ticket.priority === priorityFilter;

      return searchMatch && statusMatch && categoryMatch && priorityMatch;
    });
  }, [myTickets, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Support Specialist Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agent Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <strong className="text-white">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(false)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
          </button>

          <Link
            to="/agent/queue"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <Inbox className="w-4 h-4" />
            <span>View All Queue ({unassignedCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Assigned To Me"
          value={myAssignedCount}
          subtitle="Your active workload"
          icon={ShieldCheck}
          color="purple"
        />
        <StatsCard
          title="Unassigned in Queue"
          value={unassignedCount}
          subtitle="Ready to be claimed"
          icon={Inbox}
          color="amber"
          onClick={() => {}}
        />
        <StatsCard
          title="Resolved By Me"
          value={resolvedByMeCount}
          subtitle="Closed successfully"
          icon={CheckCircle2}
          color="emerald"
        />
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

      {/* Assigned Tickets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-purple-400" />
            My Assigned Tickets ({filteredMyTickets.length})
          </h2>
          {filteredMyTickets.length !== myTickets.length && (
            <span className="text-xs text-slate-400">
              Showing {filteredMyTickets.length} of {myTickets.length} assigned
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading assigned tickets...</p>
          </div>
        ) : filteredMyTickets.length === 0 ? (
          <div className="glass-panel py-16 px-4 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Assigned Tickets</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {myTickets.length === 0
                  ? "You have no tickets assigned right now. Browse the global incoming queue to claim tickets."
                  : "No assigned tickets match your active filters."}
              </p>
            </div>
            <Link
              to="/agent/queue"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30"
            >
              <Inbox className="w-4 h-4" />
              Claim Tickets from Queue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMyTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                isAgent={true}
                currentAgentId={user?.id}
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
          setMyTickets((prev) =>
            prev.map((t) => (t._id === updated._id ? updated : t))
          );
        }}
      />
    </div>
  );
}
