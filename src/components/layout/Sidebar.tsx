"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { getSession, clearSession, UserSession } from "@/lib/auth-mock";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const s = await getSession();
      if (!s) {
        router.push("/");
        return;
      }
      setSession(s);
    };
    loadSession();
  }, []);

  if (!session) return null;

  const handleLogout = async () => {
    await clearSession();
    router.push("/");
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: true },
    { name: "Data PMK", href: "/dashboard/pmk", icon: FileText, show: true },
    { name: "Data Skripsi", href: "/dashboard/skripsi", icon: BookOpen, show: true },
    {
      name: "Manajemen Pengguna",
      href: "/dashboard/users",
      icon: Users,
      show: session.role.toLowerCase() === "admin",
    },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const initials = session.profile?.namaLengkap
    ? session.profile.namaLengkap.split(" ").map((n) => n[0]).slice(0, 2).join("")
    : session.email.substring(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`w-[260px] h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 overflow-y-auto transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-600/20">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none tracking-tight">UNISBA</h1>
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mt-1">
                Fakultas Ekonomi
              </p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1.5">
          {menuItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 focus:outline-none ${
                    active
                      ? "bg-[#dae2fd]/30 text-[#004ac6] font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-medium"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? "text-[#004ac6]" : "text-slate-400"} />
                  {item.name}
                </Link>
              );
            })}
        </nav>

        {/* User Info Card */}
        <div className="mx-4 mb-4 p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-inner">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {session.profile?.namaLengkap || session.email}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {session.role}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 pt-4 pb-10 border-t border-slate-200 space-y-2 bg-slate-50/50">
          <Link
            href="/dashboard/settings"
            onClick={handleLinkClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard/settings" 
                ? "bg-slate-200 text-slate-900" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Settings size={18} strokeWidth={1.75} className={pathname === "/dashboard/settings" ? "text-slate-900" : "text-slate-400"} />
            Pengaturan Akun
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut size={18} strokeWidth={2} className="text-rose-500" />
            Keluar Sistem
          </button>
        </div>
      </aside>
    </>
  );
}
