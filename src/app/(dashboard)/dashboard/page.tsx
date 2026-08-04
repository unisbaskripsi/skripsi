"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { getSession, completeProfile, UserSession, UserProfile, getStoredUsers } from "@/lib/auth-mock";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Minus as TrendingFlat } from "lucide-react";

const PRODI_OPTIONS = ["Manajemen", "Akuntansi"];

function ProfileForm({ session, onComplete }: { session: UserSession; onComplete: (s: UserSession) => void }) {
  const [nim, setNim] = useState(session.profile?.nim || "");
  const [namaLengkap, setNamaLengkap] = useState(session.profile?.namaLengkap || "");
  const [prodi, setProdi] = useState(session.profile?.prodi || "Manajemen");
  const [angkatan, setAngkatan] = useState(session.profile?.angkatan || "");
  const [email, setEmail] = useState(session.profile?.email || "");
  const [noHp, setNoHp] = useState(session.profile?.noHp || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = { nim, namaLengkap, prodi, angkatan, email, noHp, fakultas: "Ekonomi" };
    const updated: UserSession = { ...session, isProfileCompleted: true, profile };
    await completeProfile(session.id, profile);
    onComplete(updated);
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lengkapi Profil Anda</h1>
        <p className="text-slate-500 mt-1 text-sm">Sebelum mengakses fitur skripsi, harap lengkapi data profil terlebih dahulu.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <Input label="Nomor Induk Mahasiswa (NIM)" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="Contoh: 10090321001" required />
            <Input label="Nama Lengkap" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} placeholder="Nama sesuai KTP..." required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase text-slate-500">Program Studi</label>
                <select className="flex h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" value={prodi} onChange={(e) => setProdi(e.target.value)}>
                  {PRODI_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input label="Angkatan" value={angkatan} onChange={(e) => setAngkatan(e.target.value)} placeholder="Contoh: 2021" required />
            </div>
            <Input label="Fakultas" value="Ekonomi" disabled />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@student.unisba.ac.id" required />
            <Input label="Nomor HP / WhatsApp" value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="Contoh: 08123456789" required />
          </div>
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
            <Button type="submit">Simpan &amp; Lanjutkan →</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [totalPMK, setTotalPMK] = useState(0);
  const [totalSkripsi, setTotalSkripsi] = useState(0);
  const [totalMahasiswa, setTotalMahasiswa] = useState(0);
  const [recentSkripsi, setRecentSkripsi] = useState<any[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [prodiData, setProdiData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const s = await getSession();
      setSession(s);

      // Fetch stats from Supabase
      const [{ count: pmkCount }, { count: skripsiCount }, { count: userCount }] = await Promise.all([
        supabase.from("pmk_documents").select("*", { count: "exact", head: true }),
        supabase.from("skripsi_documents").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "mahasiswa"),
      ]);

      setTotalPMK(pmkCount || 0);
      setTotalSkripsi(skripsiCount || 0);
      setTotalMahasiswa(userCount || 0);

      // Fetch recent skripsi
      const { data: recentS } = await supabase.from("skripsi_documents").select("*").order("created_at", { ascending: false }).limit(3);
      setRecentSkripsi(recentS || []);

      // Fetch recent students
      const { data: recentU } = await supabase.from("profiles").select("*").eq("role", "mahasiswa").order("created_at", { ascending: false }).limit(5);
      setRecentStudents(recentU || []);

      // Fetch for charts
      const { data: pmkData } = await supabase.from("pmk_documents").select("tahun");
      const { data: skripsiData } = await supabase.from("skripsi_documents").select("tahun");
      const { data: profilesData } = await supabase.from("profiles").select("prodi").eq("role", "mahasiswa");

      // Process year data
      const yearMap: Record<string, {pmk: number, skripsi: number}> = {};
      const processYear = (data: any[] | null, type: 'pmk' | 'skripsi') => {
        if (!data) return;
        data.forEach(item => {
          if (!item.tahun) return;
          const y = String(item.tahun);
          if (!yearMap[y]) yearMap[y] = { pmk: 0, skripsi: 0 };
          yearMap[y][type]++;
        });
      };
      processYear(pmkData, 'pmk');
      processYear(skripsiData, 'skripsi');
      
      let maxCount = 0;
      Object.values(yearMap).forEach(v => {
        if (v.pmk > maxCount) maxCount = v.pmk;
        if (v.skripsi > maxCount) maxCount = v.skripsi;
      });
      
      const formattedChartData = Object.entries(yearMap)
        .map(([year, counts]) => ({
          year,
          pmk: maxCount === 0 ? 0 : Math.round((counts.pmk / maxCount) * 100),
          skripsi: maxCount === 0 ? 0 : Math.round((counts.skripsi / maxCount) * 100),
          rawPmk: counts.pmk,
          rawSkripsi: counts.skripsi
        }))
        .sort((a, b) => a.year.localeCompare(b.year))
        .slice(-5);
      
      if (formattedChartData.length === 0) {
        formattedChartData.push({ year: new Date().getFullYear().toString(), pmk: 0, skripsi: 0, rawPmk: 0, rawSkripsi: 0 });
      }
      setChartData(formattedChartData);

      // Process prodi data
      let manCount = 0;
      let aktCount = 0;
      if (profilesData) {
        profilesData.forEach(p => {
          if (p.prodi?.toLowerCase() === 'manajemen') manCount++;
          if (p.prodi?.toLowerCase() === 'akuntansi') aktCount++;
        });
      }
      const totalProdi = manCount + aktCount;
      setProdiData([
        { label: "Manajemen", pct: totalProdi === 0 ? 0 : Math.round((manCount / totalProdi) * 100), count: manCount, color: "bg-blue-600" },
        { label: "Akuntansi", pct: totalProdi === 0 ? 0 : Math.round((aktCount / totalProdi) * 100), count: aktCount, color: "bg-indigo-500" },
      ]);
    };
    
    loadData();
  }, []);

  if (!session) return null;

  if (session.role === "mahasiswa" && !session.isProfileCompleted) {
    return <ProfileForm session={session} onComplete={setSession} />;
  }

  const stats = session.role === "admin"
    ? [
        { label: "TOTAL PMK", value: totalPMK, trend: "+12%", trendUp: true, color: "blue" },
        { label: "TOTAL SKRIPSI", value: totalSkripsi, trend: "+5.2%", trendUp: true, color: "indigo" },
        { label: "AKTIF MAHASISWA", value: totalMahasiswa, trend: "0%", trendUp: false, color: "slate" },
      ]
    : [
        { label: "TOTAL SKRIPSI SAYA", value: recentSkripsi.filter((x) => x.nim === session.profile?.nim).length, trend: "", trendUp: true, color: "blue" },
        { label: "STATUS PROFIL", value: "Lengkap", trend: "", trendUp: true, color: "emerald" },
        { label: "ANGKATAN", value: session.profile?.angkatan || "-", trend: "", trendUp: true, color: "slate" },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {session.role === "admin" ? "Dashboard Admin" : `Halo, ${session.profile?.namaLengkap?.split(" ")[0] || "Mahasiswa"} 👋`}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {session.role === "admin"
              ? "Ringkasan data akademik Fakultas Ekonomi UNISBA secara real-time."
              : "Selamat datang di portal pendataan skripsi mahasiswa UNISBA."}
          </p>
        </div>
        {session.role === "admin" && (
          <div className="flex gap-3">
            <Link href="/dashboard/pmk" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
              + Tambah PMK
            </Link>
            <Link href="/dashboard/skripsi" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
              + Tambah Skripsi
            </Link>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color === "blue" ? "bg-blue-50 text-blue-600" : s.color === "indigo" ? "bg-indigo-50 text-indigo-600" : s.color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              {s.trend && (
                <span className={`text-xs font-bold flex items-center gap-1 ${s.trendUp ? "text-emerald-600" : "text-amber-500"}`}>
                  {s.trendUp ? "↑" : "→"} {s.trend}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-4xl font-bold text-slate-900">{s.value}</p>
            <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
              <div className={`h-full rounded-full w-3/4 ${s.color === "blue" ? "bg-blue-600" : s.color === "indigo" ? "bg-indigo-500" : s.color === "emerald" ? "bg-emerald-500" : "bg-slate-400"}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Dokumen per Tahun</h3>
              <p className="text-sm text-slate-500">Pertumbuhan tahunan PMK dan Skripsi</p>
            </div>
          </div>
          <div className="h-52 flex items-end justify-between gap-3">
            {chartData.map((d) => (
              <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: "180px" }}>
                  <div className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-200 transition-colors" style={{ height: `${d.pmk}%` }} title={`PMK ${d.year}: ${d.rawPmk} dokumen`} />
                  <div className="flex-1 bg-blue-600 rounded-t-sm hover:bg-blue-700 transition-colors" style={{ height: `${d.skripsi}%` }} title={`Skripsi ${d.year}: ${d.rawSkripsi} dokumen`} />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{d.year}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-100" /><span className="text-xs text-slate-500">PMK</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600" /><span className="text-xs text-slate-500">Skripsi</span></div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prodi Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Distribusi Program Studi</h3>
            <div className="space-y-3">
              {prodiData.map((p) => (
                <div key={p.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{p.label} ({p.count})</span>
                    <span className="text-slate-400">{p.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group bg-white">
            <h3 className="text-base font-bold text-blue-600 mb-1">Butuh Bantuan?</h3>
            <p className="text-sm text-slate-500 mb-3">Akses panduan atau hubungi staff IT untuk kendala penggunaan sistem.</p>
            <button onClick={() => alert("Pusat bantuan sedang dikembangkan. Silakan hubungi admin di akademik@ekonomi.unisba.ac.id")} className="w-full py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
              Buka Pusat Bantuan
            </button>
            <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-blue-600/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      {session.role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Pengajuan Skripsi Terbaru</h3>
              <Link href="/dashboard/skripsi" className="text-sm text-blue-600 font-medium hover:underline">Semua →</Link>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Judul & Mahasiswa</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSkripsi.length > 0 ? recentSkripsi.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-[200px]" title={item.judul}>{item.judul}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.nama}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'Lulus' || item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-500 text-sm">
                        Belum ada data pengajuan skripsi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Students */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Mahasiswa Terdaftar</h3>
              <Link href="/dashboard/users" className="text-sm text-blue-600 font-medium hover:underline">Kelola →</Link>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama & Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">NIM</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Profil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentStudents.length > 0 ? recentStudents.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
                            {item.profile?.namaLengkap ? item.profile.namaLengkap.charAt(0).toUpperCase() : item.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-[150px]">{item.profile?.namaLengkap || "Belum melengkapi"}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.profile?.nim || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.isProfileComplete ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.isProfileComplete ? "Lengkap" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                        Belum ada mahasiswa yang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mahasiswa: Profile Summary */}
      {session.role === "mahasiswa" && session.profile && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Data Profil Anda</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              { label: "Nama Lengkap", value: session.profile.namaLengkap },
              { label: "NIM", value: session.profile.nim },
              { label: "Program Studi", value: session.profile.prodi },
              { label: "Angkatan", value: session.profile.angkatan },
              { label: "Fakultas", value: session.profile.fakultas },
              { label: "Email", value: session.profile.email },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">{f.label}</p>
                <p className="font-semibold text-slate-800">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
