"use client";

import React, { useState, useEffect } from "react";
import { getSession, UserSession } from "@/lib/auth-mock";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Lock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastContext";

export default function SettingsPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const init = async () => {
      const s = await getSession();
      if (s) {
        setSession(s);
        setNama(s.profile?.namaLengkap || "");
        setEmail(s.email);
        setNoHp(s.profile?.noHp || "");
      }
    };
    init();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);

    try {
      // Update email/password in Supabase Auth if changed
      const authUpdates: any = {};
      if (email !== session.email) authUpdates.email = email;
      if (password) authUpdates.password = password;
      
      if (Object.keys(authUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser(authUpdates);
        if (error) throw error;
      }

      // Update profile in profiles table
      const profileUpdates: any = {
        nama_lengkap: nama,
        no_hp: noHp,
      };
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", session.id);

      if (profileError) throw profileError;

      // Update current session locally to reflect changes immediately
      const updatedSession = {
        ...session,
        email,
        profile: {
          ...session.profile,
          namaLengkap: nama,
          noHp,
        } as any
      };
      setSession(updatedSession);
      setSession(updatedSession);
      showToast("Perubahan profil berhasil disimpan!", "success");
      if (password) setPassword(""); // clear password field
    } catch (err: any) {
      showToast("Gagal mengupdate profil: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan Akun</h1>
        <p className="text-slate-500 text-sm mt-1">
          Perbarui informasi profil dan keamanan akun Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Profil */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h2 className="text-base font-bold text-slate-800">Informasi Pribadi</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-4">
                <Input 
                  label="Nama Lengkap" 
                  value={nama} 
                  onChange={(e) => setNama(e.target.value)} 
                  placeholder="Masukkan nama lengkap..." 
                  required 
                />
                <Input 
                  label="Email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@unisba.ac.id" 
                  required 
                />
                <Input 
                  label="Nomor Handphone" 
                  value={noHp} 
                  onChange={(e) => setNoHp(e.target.value)} 
                  placeholder="08..." 
                />
              </div>

              <hr className="my-6 border-slate-200" />

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Lock size={16} className="text-slate-400" /> Keamanan
                </h3>
                <Input 
                  label="Password Baru (Opsional)" 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Kosongkan jika tidak ingin mengubah password" 
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Akses Cepat Admin */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-md p-6 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Status Akun</p>
              <h3 className="text-xl font-bold mb-4">{session.role.toLowerCase() === "admin" ? "Administrator" : "Mahasiswa"}</h3>
              <p className="text-sm text-blue-100/90 leading-relaxed">
                {session.role.toLowerCase() === "admin" 
                  ? "Anda memiliki akses penuh untuk mengelola seluruh data fakultas dan akun pengguna lain."
                  : "Anda dapat mengajukan dan mengelola data skripsi maupun PMK Anda sendiri."}
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
          </div>

          {session.role.toLowerCase() === "admin" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Manajemen Pengguna</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Kelola akses akun admin & mahasiswa.</p>
                </div>
              </div>
              <Link href="/dashboard/users" className="flex w-full">
                <Button variant="secondary" className="w-full text-sm py-2 bg-slate-50 hover:bg-slate-100 border-slate-200 flex justify-between items-center group">
                  Buka Manajemen Pengguna
                  <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
