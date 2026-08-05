"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Eye, FileUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import Toast from "@/components/ui/Toast";
import { getSession, UserSession } from "@/lib/auth-mock";
import { supabase } from "@/lib/supabase";

const STATUS_OPTIONS = ["Diajukan", "Diterima", "Ditolak"];
const PRODI_OPTIONS = ["Manajemen", "Akuntansi"];

export default function PMKManagementPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [prodi, setProdi] = useState("Manajemen");
  const [angkatan, setAngkatan] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [judul, setJudul] = useState("");
  const [status, setStatus] = useState("Diajukan");
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchData = async (userSession: UserSession) => {
    let query = supabase.from("pmk_documents").select("*").order("created_at", { ascending: false });
    
    // RLS in Supabase handles the permissions, but we can explicitly filter if needed
    // If admin, they see all (handled by RLS). If student, they only see theirs.
    
    const { data: pmkData, error } = await query;
    if (!error && pmkData) {
      setData(pmkData);
    }
  };

  useEffect(() => {
    const init = async () => {
      const s = await getSession();
      setSession(s);
      if (s) {
        fetchData(s);
      }
    };
    init();
  }, []);

  const openAdd = () => {
    if (!session) return;
    if (session.role === "mahasiswa" && !session.isProfileCompleted) {
      alert("Harap lengkapi profil Anda di halaman Dashboard terlebih dahulu!");
      return;
    }
    setEditingItem(null);
    if (session.role === "mahasiswa" && session.profile) {
      setNim(session.profile.nim);
      setNama(session.profile.namaLengkap);
      setProdi(session.profile.prodi);
      setAngkatan(session.profile.angkatan);
    } else {
      setNim(""); setNama(""); setProdi("Manajemen"); setAngkatan("");
    }
    setTahun(new Date().getFullYear());
    setJudul("");
    setStatus("Diajukan");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    if (!session) return;
    if (session.role === "mahasiswa" && session.profile?.nim !== item.nim) {
      alert("Anda hanya dapat mengedit data PMK milik Anda sendiri!");
      return;
    }
    setEditingItem(item);
    setNim(item.nim); 
    setNama(item.nama_mahasiswa); 
    setProdi(item.prodi);
    setAngkatan(item.angkatan); 
    setTahun(item.tahun); 
    setJudul(item.judul);
    setStatus(item.status);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openDetail = (item: any) => { setViewingItem(item); setIsDetailOpen(true); };

  const handleDelete = async (item: any) => {
    if (!session || session.role.toLowerCase() !== "admin") {
      alert("Hanya Admin yang dapat menghapus data PMK!");
      return;
    }
    if (confirm(`Hapus data PMK milik ${item.nama_mahasiswa}?`)) {
      setDeletingId(item.id);
      try {
        await supabase.from("pmk_documents").delete().eq("id", item.id);
        setData(data.filter((x) => x.id !== item.id));
        setToast({ show: true, message: "Data PMK berhasil dihapus!" });
      } catch (error) {
        alert("Terjadi kesalahan saat menghapus data.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleStatusChange = async (item: any, newStatus: string) => {
    await supabase.from("pmk_documents").update({ status: newStatus }).eq("id", item.id);
    setData(data.map((d) => d.id === item.id ? { ...d, status: newStatus } : d));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Ukuran file maksimal adalah 20 MB. Silakan kompres file PDF Anda terlebih dahulu.");
        e.target.value = ""; // Reset input
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let gdrive_file_id = editingItem ? editingItem.gdrive_file_id : null;

      if (selectedFile) {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        const token = supabaseSession?.access_token || "";

        // Tahap 1: Minta Resumable Upload Session URL ke server
        const initRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            action: "init", 
            fileName: selectedFile.name, 
            fileType: selectedFile.type,
            fileSize: selectedFile.size
          }),
        });
        const initData = await initRes.json();
        
        if (!initData.success || !initData.uploadUrl) {
          throw new Error("Gagal menginisiasi upload ke Google Drive: " + (initData.error || "Unknown error"));
        }

        // Tahap 2: Upload file langsung ke URL Google Drive (Bypass Vercel)
        const uploadRes = await fetch(initData.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": selectedFile.type
          },
          body: selectedFile
        });

        if (!uploadRes.ok) {
          throw new Error("Gagal mengupload file secara langsung ke Google Drive.");
        }

        let uploadData;
        try {
          uploadData = await uploadRes.json();
        } catch (err) {
          throw new Error("Gagal membaca respons dari Google Drive.");
        }

        const fileId = uploadData?.id;
        if (!fileId) {
          throw new Error("File ID tidak ditemukan setelah upload.");
        }

        // Tahap 3: Kirim fileId ke server untuk setting permissions dan mendapatkan webViewLink
        const finalizeRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ action: "finalize", fileId }),
        });
        const finalizeData = await finalizeRes.json();

        if (finalizeData.success) {
          gdrive_file_id = finalizeData.webViewLink; // we save the link so it's easy to click
        } else {
          throw new Error("Gagal menyelesaikan upload (set permissions): " + finalizeData.error);
        }
      }

      const payload = {
        nim,
        nama_mahasiswa: nama,
        fakultas: "Ekonomi",
        prodi,
        angkatan,
        tahun,
        judul,
        status,
        user_id: session?.id,
        gdrive_file_id
      };

      if (editingItem) {
        await supabase.from("pmk_documents").update(payload).eq("id", editingItem.id);
      } else {
        await supabase.from("pmk_documents").insert([payload]);
      }
      
      if (session) fetchData(session);
      setIsModalOpen(false);
      setToast({ show: true, message: "Data PMK berhasil disimpan!" });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((item) => {
    const matchSearch =
      item.nama_mahasiswa.toLowerCase().includes(search.toLowerCase()) ||
      item.nim.includes(search) ||
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.prodi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || item.status === filterStatus;
    const matchTahun = !filterTahun || item.tahun.toString() === filterTahun;
    return matchSearch && matchStatus && matchTahun;
  });

  if (!session) return null;

  return (
    <div className="space-y-6">
      {loading && <LoadingOverlay message="Menyimpan data PMK..." />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Data PMK</h1>
          <p className="text-slate-500 text-sm mt-1">
            {session.role.toLowerCase() === "admin" ? "Kelola seluruh data Penelitian Mahasiswa Kompetitif (PMK)." : "Daftar semua data PMK. Anda hanya dapat mengedit data milik Anda."}
          </p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2 self-start flex-shrink-0">
          <Plus size={16} /> Tambah Data PMK
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari NIM, Nama, atau Judul PMK..."
            className="w-full text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-sm"
          value={filterTahun}
          onChange={(e) => setFilterTahun(e.target.value)}
        >
          <option value="">Semua Tahun</option>
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">NIM</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Mahasiswa</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Program Studi</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Judul PMK</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tahun</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map((item) => {
                const isOwn = session.role.toLowerCase() === "mahasiswa" && session.profile?.nim === item.nim;
                const canEdit = session.role.toLowerCase() === "admin" || isOwn;
                const canDelete = session.role.toLowerCase() === "admin";
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.nim}</td>
                    <td className="px-6 py-4 text-slate-700">{item.nama_mahasiswa}</td>
                    <td className="px-6 py-4 text-slate-500">{item.prodi}</td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="truncate block text-slate-700" title={item.judul}>{item.judul}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.tahun}</td>
                    <td className="px-6 py-4">
                      {session.role.toLowerCase() === "admin" ? (
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item, e.target.value)}
                          className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${item.status === "Diterima" ? "bg-emerald-50 text-emerald-700" : item.status === "Ditolak" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${item.status === "Diterima" ? "bg-emerald-50 text-emerald-700" : item.status === "Ditolak" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openDetail(item)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Lihat Detail">
                          <Eye size={15} />
                        </button>
                        {item.gdrive_file_id && (
                          <a href={item.gdrive_file_id} target="_blank" rel="noopener noreferrer" className="p-1.5 block rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Lihat/Download File (Google Drive)">
                            <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          </a>
                        )}
                        {canEdit && (
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit2 size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            onClick={() => handleDelete(item)} 
                            disabled={deletingId === item.id}
                            className={`p-1.5 rounded-lg transition-colors ${deletingId === item.id ? "text-slate-300" : "text-slate-400 hover:bg-red-50 hover:text-red-600"}`} 
                            title="Hapus"
                          >
                            {deletingId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Tidak ada data PMK yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">Menampilkan {filtered.length} dari {data.length} data</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editingItem ? "Edit Data PMK" : "Tambah Data PMK"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <Input label="NIM Mahasiswa" value={nim} onChange={(e) => setNim(e.target.value)} disabled={session.role === "mahasiswa"} required />
                <Input label="Nama Mahasiswa" value={nama} onChange={(e) => setNama(e.target.value)} disabled={session.role === "mahasiswa"} required />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Program Studi</label>
                    <select className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50" value={prodi} onChange={(e) => setProdi(e.target.value)} disabled={session.role === "mahasiswa"}>
                      {PRODI_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <Input label="Angkatan" value={angkatan} onChange={(e) => setAngkatan(e.target.value)} disabled={session.role === "mahasiswa"} required />
                </div>
                <Input label="Tahun" type="number" value={tahun.toString()} onChange={(e) => setTahun(parseInt(e.target.value))} required />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul PMK</label>
                  <textarea className="w-full min-h-[80px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Masukkan judul PMK lengkap..." required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">File Laporan (PDF)</label>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {editingItem?.gdrive_file_id && !selectedFile && (
                    <p className="text-xs text-slate-500 mt-1">File saat ini sudah ada. Biarkan kosong jika tidak ingin mengganti file.</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                  <select className={`h-10 w-full rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${session.role.toLowerCase() !== "admin" ? "bg-slate-50 cursor-not-allowed" : "bg-white"}`} value={status} onChange={(e) => setStatus(e.target.value)} disabled={session.role.toLowerCase() !== "admin"}>
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={loading}>Batal</Button>
                <Button type="submit" disabled={loading || !nim || !nama || !judul || (!editingItem && !selectedFile)}>
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && viewingItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Detail Data PMK</h2>
              <button onClick={() => setIsDetailOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Nama Mahasiswa", value: viewingItem.nama_mahasiswa },
                  { label: "NIM", value: viewingItem.nim },
                  { label: "Fakultas", value: viewingItem.fakultas },
                  { label: "Program Studi", value: viewingItem.prodi },
                  { label: "Angkatan", value: viewingItem.angkatan },
                  { label: "Tahun", value: viewingItem.tahun },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">{f.label}</p>
                    <p className="font-semibold text-slate-800">{f.value}</p>
                  </div>
                ))}
              </div>
              <hr className="border-slate-100" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">Judul PMK</p>
                <p className="text-slate-800 font-semibold leading-relaxed">{viewingItem.judul}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">Status</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${viewingItem.status === "Diterima" ? "bg-emerald-50 text-emerald-700" : viewingItem.status === "Ditolak" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                  {viewingItem.status}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
            </div>
            </div>
          </div>
        </div>
      )}

      <Toast isVisible={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
