import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // 'customer' or 'agent'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    try {
      const storedToken = localStorage.getItem("helpdesk_token");
      const storedUser = localStorage.getItem("helpdesk_user");
      const storedRole = localStorage.getItem("helpdesk_role");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setRole(storedRole || "customer");
      }
    } catch (e) {
      console.error("Failed to restore session from localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginCustomer = async (email, password) => {
    const res = await authApi.customerLogin({ email, password });
    const { token, user } = res.data;
    const userRole = user.role || "customer";

    setToken(token);
    setUser(user);
    setRole(userRole);

    localStorage.setItem("helpdesk_token", token);
    localStorage.setItem("helpdesk_user", JSON.stringify(user));
    localStorage.setItem("helpdesk_role", userRole);

    return { user, token, role: userRole };
  };

  const registerCustomer = async (name, email, password) => {
    const res = await authApi.customerRegister({ name, email, password });
    return res.data;
  };

  const loginAgent = async (email, password) => {
    const res = await authApi.agentLogin({ email, password });
    const { token, agent } = res.data;
    const userRole = "agent";

    setToken(token);
    setUser(agent);
    setRole(userRole);

    localStorage.setItem("helpdesk_token", token);
    localStorage.setItem("helpdesk_user", JSON.stringify(agent));
    localStorage.setItem("helpdesk_role", userRole);

    return { user: agent, token, role: userRole };
  };

  const registerAgent = async (name, email, password) => {
    const res = await authApi.agentRegister({ name, email, password });
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem("helpdesk_token");
    localStorage.removeItem("helpdesk_user");
    localStorage.removeItem("helpdesk_role");
  };

  const value = {
    user,
    token,
    role,
    loading,
    isAuthenticated: !!token && !!user,
    isAgent: role === "agent",
    isCustomer: role === "customer",
    loginCustomer,
    registerCustomer,
    loginAgent,
    registerAgent,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
