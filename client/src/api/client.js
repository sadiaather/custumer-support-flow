import axios from "axios";

export const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("helpdesk_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    
    // Auto logout if token expired or unauthorized
    if (error.response?.status === 401 && localStorage.getItem("helpdesk_token")) {
      const isAuthRoute =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/agents/login");
      if (!isAuthRoute) {
        localStorage.removeItem("helpdesk_token");
        localStorage.removeItem("helpdesk_user");
        localStorage.removeItem("helpdesk_role");
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authApi = {
  customerLogin: (data) => api.post("/auth/login", data),
  customerRegister: (data) => api.post("/auth/register", data),
  agentLogin: (data) => api.post("/agents/login", data),
  agentRegister: (data) => api.post("/agents/register", data),
};

// Agent Services
export const agentApi = {
  getDashboard: () => api.get("/agents/dashboard"),
};

// Ticket Services
export const ticketApi = {
  getAllTickets: () => api.get("/tickets/all"),
  getMyTickets: () => api.get("/tickets/my"),
  getAgentTickets: () => api.get("/tickets/agent/my"),
  getSingleTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (data) => api.post("/tickets", data),
  assignTicket: (ticketIdOrNumber, agentId) =>
    api.patch(`/tickets/${ticketIdOrNumber}/assign`, { agentId }),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status`, data),
};

// Message Services
export const messageApi = {
  getMessages: (ticketId, isAgent = false) =>
    isAgent
      ? api.get(`/messages/agent/${ticketId}`)
      : api.get(`/messages/${ticketId}`),
  sendMessage: (ticketId, message, isAgent = false) =>
    isAgent
      ? api.post(`/messages/agent/${ticketId}`, { message })
      : api.post(`/messages/${ticketId}`, { message }),
};

export default api;
