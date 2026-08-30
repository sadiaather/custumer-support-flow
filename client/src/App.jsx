import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/common/ToastContainer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import CreateTicketModal from "./components/tickets/CreateTicketModal";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerTicketDetail from "./pages/customer/CustomerTicketDetail";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentTicketQueue from "./pages/agent/AgentTicketQueue";
import AgentTicketDetail from "./pages/agent/AgentTicketDetail";
import NotFoundPage from "./pages/NotFoundPage";

function AppContent() {
  const { isCustomer } = useAuth();
  const [globalCreateModalOpen, setGlobalCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar onOpenCreateModal={isCustomer ? () => setGlobalCreateModalOpen(true) : null} />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Protected Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/ticket/:id"
            element={
              <ProtectedRoute allowedRole="customer">
                <CustomerTicketDetail />
              </ProtectedRoute>
            }
          />

          {/* Agent Protected Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRole="agent">
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/queue"
            element={
              <ProtectedRoute allowedRole="agent">
                <AgentTicketQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/ticket/:id"
            element={
              <ProtectedRoute allowedRole="agent">
                <AgentTicketDetail />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer />

      {/* Global Ticket Creation Modal */}
      {isCustomer && (
        <CreateTicketModal
          isOpen={globalCreateModalOpen}
          onClose={() => setGlobalCreateModalOpen(false)}
          onTicketCreated={() => {
            // If on customer dashboard, component listens to socket or we can reload
            window.location.href = "/customer/dashboard";
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
