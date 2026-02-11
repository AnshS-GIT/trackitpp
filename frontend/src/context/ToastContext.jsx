import { createContext, useContext, useState, useCallback, useEffect } from "react";
import Toast from "../components/Toast";
import eventBus from "../utils/eventBus";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Subscribe to Event Bus for global error handling from non-React files (axios)
    useEffect(() => {
        const handleShowToast = (data) => {
            addToast(data.message, data.type);
        };

        eventBus.on("SHOW_TOAST", handleShowToast);

        return () => {
            eventBus.remove("SHOW_TOAST", handleShowToast);
        };
    }, [addToast]);

    const value = {
        success: (msg) => addToast(msg, "success"),
        error: (msg) => addToast(msg, "error"),
        info: (msg) => addToast(msg, "info"),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-5 right-5 z-50 flex flex-col items-end space-y-2 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto w-full">
                        <Toast
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={removeToast}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
