import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = "info", duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast = { id, title, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message, title = "Success") => {
      addToast({ title, message, type: "success" });
    },
    [addToast]
  );

  const error = useCallback(
    (message, title = "Error") => {
      addToast({ title, message, type: "error" });
    },
    [addToast]
  );

  const info = useCallback(
    (message, title = "Notice") => {
      addToast({ title, message, type: "info" });
    },
    [addToast]
  );

  const warning = useCallback(
    (message, title = "Warning") => {
      addToast({ title, message, type: "warning" });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info, warning }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
