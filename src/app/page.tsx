"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth-mock";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const login = async () => {
      const result = await loginUser(email, password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Login gagal.");
        setLoading(false);
      }
    };
    login();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor: "#f7f9fb",
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(37,99,235,0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0,74,198,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(37,99,235,0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(0,74,198,0.05) 0px, transparent 50%)",
      }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] bg-slate-400/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-[1100px] w-full flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
        {/* Left: Illustration */}
        <div className="hidden md:flex flex-1 flex-col items-start text-left space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
              </svg>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Academic Portal</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 leading-tight tracking-tight max-w-md">
              Sistem Pendataan{" "}
              <span className="text-blue-600">PMK &amp; Skripsi</span>
            </h1>
            <p className="text-base text-slate-500 max-w-sm leading-relaxed">
              Kelola data akademik mahasiswa Fakultas Ekonomi UNISBA dengan sistem pendataan modern yang terstruktur.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6">
            <img
              src="/unisba-logo.png"
              alt="Logo UNISBA"
              className="w-72 h-72 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">UNISBA</h2>
              <p className="text-base font-semibold text-blue-600">Universitas Islam Balitar</p>
              <p className="text-sm text-slate-500">Fakultas Ekonomi — Blitar</p>
            </div>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="w-full max-w-[440px] flex-shrink-0">
          <div className="glass-card p-8 md:p-10 rounded-3xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                <img src="/unisba-logo.png" alt="Logo UNISBA" className="w-11 h-11 object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Selamat Datang</h2>
              <p className="text-sm text-slate-500">Masukkan email dan password untuk masuk</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase ml-1" htmlFor="email">
                  Email
                </label>
                <div className="relative group">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@student.unisba.ac.id"
                    className="w-full h-[52px] pl-12 pr-4 bg-white/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase" htmlFor="password">
                    Password
                  </label>
                  <button type="button" onClick={() => alert("Fitur lupa password sedang dalam pengembangan. Silakan hubungi staff fakultas.")} className="text-xs font-semibold text-blue-600 hover:underline">Lupa Password?</button>
                </div>
                <div className="relative group">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[52px] pl-12 pr-12 bg-white/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                    <span>Masuk ke Portal</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200/60 text-center space-y-2">
              <p className="text-sm text-slate-500">
                Mahasiswa baru?{" "}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                  Daftar Akun Mahasiswa
                </Link>
              </p>
              <p className="text-xs text-slate-400">
                Butuh bantuan?{" "}
                <button onClick={() => alert("Hubungi BAAK Fakultas Ekonomi di email: akademik@ekonomi.unisba.ac.id")} className="text-blue-600 hover:underline">Hubungi Staff Fakultas</button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
