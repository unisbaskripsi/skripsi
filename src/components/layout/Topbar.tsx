"use client";

import React, { useState, useEffect } from "react";
import { getSession, UserSession } from "@/lib/auth-mock";

export function Topbar() {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      setSession(await getSession());
    };
    loadSession();
  }, []);

  if (!session) return null;

  const initials = session.profile?.namaLengkap
    ? session.profile.namaLengkap.split(" ").map((n) => n[0]).slice(0, 2).join("")
    : session.email.substring(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2.5 cursor-pointer group pl-1">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
        {initials}
      </div>
      <div className="hidden sm:block text-right">
        <p className="text-sm font-semibold text-slate-800 leading-tight">
          {session.profile?.namaLengkap || session.email}
        </p>
        <p className="text-[11px] text-slate-500 uppercase">
          {session.role === "admin" ? "Admin" : "Mahasiswa"}
        </p>
      </div>
    </div>
  );
}
