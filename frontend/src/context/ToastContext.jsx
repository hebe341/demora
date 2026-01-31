import React, { useState, useCallback } from 'react';

const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = { addToast, removeToast, toasts };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }) {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${typeStyles[toast.type]} text-white p-4 rounded-lg shadow-lg flex items-center justify-between animate-slide-in`}
        >
          <div className="flex items-center gap-2">
            <span>{typeIcons[toast.type]}</span>
            <p>{toast.message}</p>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-4 text-white hover:opacity-75"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
