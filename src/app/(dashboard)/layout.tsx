"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Menu } from "lucide-react";
import { useToast } from "@/components/ui/ToastContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-4 md:px-6 z-30 transition-all">
          <div className="flex items-center flex-1 max-w-xl gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="relative w-full max-w-xs md:max-w-full group">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari dokumen..."
                className="w-full bg-slate-100 border-none rounded-xl pl-9 md:pl-10 pr-4 py-1.5 md:py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4 flex-shrink-0">
            <button 
              onClick={() => showToast("Tidak ada notifikasi baru.", "info")}
              className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors relative"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="h-6 md:h-8 w-px bg-slate-200" />
            <Topbar />
          </div>
        </header>

        <main className="flex-1 mt-16 overflow-y-auto w-full overflow-x-hidden">
          <div className="max-w-[1280px] mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
