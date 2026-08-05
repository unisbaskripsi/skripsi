import React, { useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: ToastType;
  onClose: () => void;
}

export default function Toast({ message, isVisible, type = "info", onClose }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleAnimationEnd = () => {
    if (!isVisible) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700/50 transition-all ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {type === "success" && <CheckCircle2 size={18} className="text-emerald-400" />}
      {type === "error" && <AlertCircle size={18} className="text-red-400" />}
      {type === "info" && <Info size={18} className="text-blue-400" />}
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
}

