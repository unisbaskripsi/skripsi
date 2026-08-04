"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Edit2, Trash2, Search, X, Eye, Shield, GraduationCap, AlertTriangle } from "lucide-react";
import { getSession, UserSession } from "@/lib/auth-mock";
import { supabase } from "@/lib/supabase";

const PRODI_OPTIONS = ["Manajemen", "Akuntansi"];

export default function UserManagementPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form (dipakai bersama untuk Edit dan Add)
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"mahasiswa" | "admin">("mahasiswa");
  const [formNama, setFormNama] = useState("");
  const [formNim, setFormNim] = useState("");
  const [formProdi, setFormProdi] = useState("Manajemen");
  const [formAngkatan, setFormAngkatan] = useState("");
  const [formNoHp, setFormNoHp] = useState("");

  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
  };

  useEffect(() => {
    const init = async () => {
      setSession(await getSession());
      loadUsers();
    };
    init();
  }, []);

  const openAddUser = () => {
    setEditingUser(null);
    setFormEmail("");
    setFormPassword("");
    setFormRole("admin"); // Default ke admin karena user minta tambah admin
    setFormNama("");
    setFormNim("");
    setFormProdi("Manajemen");
    setFormAngkatan("");
    setFormNoHp("");
    setIsAddUserOpen(true);
  };

  const openEdit = (u: any) => {
    setEditingUser(u);
    setFormEmail(u.email);
    setFormPassword(""); // Password tidak diisi saat edit profil
    setFormRole(u.role);
    setFormNama(u.nama_lengkap || "");
    setFormNim(u.nim || "");
    setFormProdi(u.prodi || "Manajemen");
    setFormAngkatan(u.angkatan || "");
    setFormNoHp(u.no_hp || "");
    setIsModalOpen(true);
  };

  const handleDelete = (u: any) => {
    if (session?.id === u.id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri!");
      return;
    }
    setUserToDelete(u);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      const token = supabaseSession?.access_token || "";

      const res = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus akun");
      
      setIsDeleteOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const updates: any = {
        role: formRole,
        nim: formNim,
        nama_lengkap: formNama,
        prodi: formProdi,
        angkatan: formAngkatan,
        no_hp: formNoHp,
      };
      await supabase.from("profiles").update(updates).eq("id", editingUser.id);
      setIsModalOpen(false);
    } else {
      // Create New User via API
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        const token = supabaseSession?.access_token || "";

        const res = await fetch("/api/users", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({
            email: formEmail,
            password: formPassword,
            role: formRole,
            nama_lengkap: formNama,
            nim: formNim,
            prodi: formProdi,
            angkatan: formAngkatan,
            no_hp: formNoHp,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menambah akun");
        alert("Berhasil menambah akun baru!");
        setIsAddUserOpen(false);
      } catch (err: any) {
        alert("Error: " + err.message);
        return; // Jangan load users jika gagal
      }
    }

    loadUsers();
  };

  const filtered = users.filter((u) => {
    const name = u.nama_lengkap || u.email;
    const nim = u.nim || "";
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      nim.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (!session) return null;
  if (session.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield size={64} className="text-slate-200 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Akses Ditolak</h1>
        <p className="text-slate-500 mt-2">Halaman ini hanya dapat diakses oleh Administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
          <p className="text-gray-500">Kelola data mahasiswa dan admin sistem</p>
        </div>
        <Button onClick={openAddUser} className="bg-primary text-white">
          + Tambah Akun
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Cari Nama, NIM, atau Email..." className="w-full text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-sm" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">Semua Role</option>
          <option value="mahasiswa">Mahasiswa</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pengguna</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">NIM / Prodi</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <p className="font-semibold text-slate-800">{u.nama_lengkap || "Belum melengkapi profil"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {u.role === "mahasiswa" ? (
                      <>
                        <p className="font-medium text-slate-700">{u.nim || "-"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{u.prodi} {u.angkatan ? `(${u.angkatan})` : ""}</p>
                      </>
                    ) : (
                      <p className="text-slate-400 text-xs italic">Akses Admin</p>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${u.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                      {u.role === "admin" ? <Shield size={12} /> : <GraduationCap size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => { setViewingUser(u); setIsDetailOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Lihat Detail"><Eye size={15} /></button>
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit Pengguna"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Hapus Pengguna"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">Tidak ada pengguna yang ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">Menampilkan {filtered.length} dari {users.length} pengguna</p>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {(isModalOpen || isAddUserOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {isAddUserOpen ? "Tambah Akun Baru" : "Edit Profil Pengguna"}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setIsAddUserOpen(false);
                }} 
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 border-b pb-2">Informasi Akun</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input 
                      value={formEmail} 
                      onChange={e => setFormEmail(e.target.value)} 
                      disabled={!isAddUserOpen} // Email tidak bisa diganti jika sedang edit
                      required
                      type="email"
                    />
                  </div>

                  {isAddUserOpen && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <Input 
                        value={formPassword} 
                        onChange={e => setFormPassword(e.target.value)} 
                        required={isAddUserOpen}
                        type="password"
                        placeholder="Minimal 6 karakter"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hak Akses (Role)</label>
                    <select
                      value={formRole}
                      onChange={e => setFormRole(e.target.value as any)}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="mahasiswa">Mahasiswa</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 border-b pb-2">Profil Pribadi</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <Input value={formNama} onChange={e => setFormNama(e.target.value)} required={formRole === 'mahasiswa'} />
                  </div>

                  {formRole === "mahasiswa" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                        <Input value={formNim} onChange={e => setFormNim(e.target.value)} required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                          <select
                            value={formProdi}
                            onChange={e => setFormProdi(e.target.value)}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            {PRODI_OPTIONS.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                          <Input value={formAngkatan} onChange={e => setFormAngkatan(e.target.value)} placeholder="Contoh: 2021" required />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                    <Input value={formNoHp} onChange={e => setFormNoHp(e.target.value)} />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsAddUserOpen(false);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-primary text-white">
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && viewingUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Detail Profil</h2>
              <button onClick={() => setIsDetailOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Nama Lengkap", value: viewingUser.nama_lengkap || "-" },
                  { label: "Email", value: viewingUser.email },
                  { label: "Role", value: viewingUser.role.toUpperCase() },
                  { label: "No HP", value: viewingUser.no_hp || "-" },
                  { label: "NIM", value: viewingUser.nim || "-" },
                  { label: "Fakultas", value: viewingUser.fakultas || "-" },
                  { label: "Program Studi", value: viewingUser.prodi || "-" },
                  { label: "Angkatan", value: viewingUser.angkatan || "-" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">{f.label}</p>
                    <p className="font-semibold text-slate-800">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 pb-0 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Hapus Akun?</h2>
              <p className="text-slate-500 text-sm mb-6">
                Apakah Anda yakin ingin menghapus akun <span className="font-semibold text-slate-700">{userToDelete.nama_lengkap || userToDelete.email}</span>? Tindakan ini tidak dapat dibatalkan dan semua data pengguna ini akan hilang secara permanen.
              </p>
            </div>
            <div className="p-6 pt-4 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-2xl">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setIsDeleteOpen(false);
                  setUserToDelete(null);
                }}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Akun"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
