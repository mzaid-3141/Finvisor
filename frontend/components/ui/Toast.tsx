"use client";

import React from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { clsx } from "clsx";
import { Toast as ToastType } from "./useToast";

interface ToastContainerProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

const icons = {
  success: <CheckCircle size={18} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={18} className="text-red-400 shrink-0" />,
  info: <Info size={18} className="text-blue-400 shrink-0" />,
};

const borderColors = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  info: "border-l-blue-500",
};

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "pointer-events-auto flex items-start gap-3 bg-[#0d1526] border border-[#1e2d47] border-l-4 rounded-xl p-4 shadow-2xl",
            "animate-in slide-in-from-right-5 fade-in duration-300",
            borderColors[toast.type]
          )}
        >
          {icons[toast.type]}
          <p className="text-sm text-[#f1f5f9] flex-1 leading-relaxed">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#64748b] hover:text-[#f1f5f9] transition-colors duration-200 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
