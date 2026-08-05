import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({ isOpen, title, message, isLoading = false, onConfirm, onClose }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertTriangle size={24} />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
          
          <div className="flex gap-3 w-full pt-2">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              disabled={isLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
