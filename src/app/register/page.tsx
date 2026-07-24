"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerMahasiswa } from "@/lib/auth-mock";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const register = async () => {
      const result = await registerMahasiswa(email, password);
      if (result.success) {
        // Redirect ke dashboard, profil belum lengkap → akan diminta isi profil
        router.push("/dashboard");
      } else {
        setError(result.error || "Pendaftaran gagal.");
        setLoading(false);
      }
    };
    register();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor: "#f7f9fb",
        backgroundImage: "radial-gradient(at 0% 0%, rgba(37,99,235,0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(37,99,235,0.1) 0px, transparent 50%)",
      }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1000px] w-full flex flex-col md:flex-row items-center justify-center gap-12">
        {/* Left: Logo Panel */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center space-y-6">
          <img
            src="/unisba-logo.png"
            alt="Logo UNISBA"
            className="w-64 h-64 object-contain drop-shadow-xl"
          />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">UNISBA</h2>
            <p className="text-base font-semibold text-blue-600">Universitas Islam Balitar</p>
            <p className="text-sm text-slate-500 mt-2">Fakultas Ekonomi</p>
          </div>
        </div>

        {/* Right: Register Card */}
        <div className="w-full max-w-[460px]">
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/unisba-logo.png"
              alt="Logo UNISBA"
              className="w-20 h-20 object-contain mb-4 md:hidden"
            />
            <div className="hidden md:flex w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 items-center justify-center mb-4">
              <img src="/unisba-logo.png" alt="Logo UNISBA" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Daftar Akun Mahasiswa</h2>
            <p className="text-sm text-slate-500 mt-1">Buat akun untuk mengakses portal akademik UNISBA</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@student.unisba.ac.id"
                className="w-full h-[48px] px-4 bg-white/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-[48px] pl-4 pr-12 bg-white/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase ml-1">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password..."
                className="w-full h-[48px] px-4 bg-white/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                required
              />
            </div>

            <div className="pt-1">
              <p className="text-xs text-slate-400">
                Dengan mendaftar, Anda menyetujui bahwa data yang diberikan adalah benar dan merupakan mahasiswa aktif Fakultas Ekonomi UNISBA.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Buat Akun &amp; Masuk</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-200/60 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/" className="text-blue-600 font-semibold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
