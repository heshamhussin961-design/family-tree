import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onRemove }) {
    const icons = {
        success: <CheckCircle2 className="text-primary" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-accent" size={20} />,
    };

    const bgColors = {
        success: "bg-primary/10 border-primary/20",
        error: "bg-red-500/10 border-red-500/20",
        info: "bg-accent/10 border-accent/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md shadow-2xl ${bgColors[type]}`}
            style={{ minWidth: "300px" }}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1 text-sm font-bold text-gray-800 dark:text-white">
                {message}
            </div>
            <button
                onClick={onRemove}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
                <X size={16} className="text-gray-400" />
            </button>
        </motion.div>
    );
}

export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onRemove={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
