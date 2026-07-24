import { supabase } from "./supabase";

export interface StoredUser {
  id: string;
  email: string;
  password?: string;
  role: "mahasiswa" | "admin";
  isProfileComplete: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  nim: string;
  namaLengkap: string;
  fakultas: string;
  prodi: string;
  angkatan: string;
  email: string;
  noHp: string;
}

export interface UserSession {
  id: string;
  email: string;
  role: "mahasiswa" | "admin";
  isProfileCompleted: boolean;
  profile?: UserProfile;
}

// ---- Data Store (Supabase) ----

export async function getStoredUsers(): Promise<StoredUser[]> {
  const { data: profiles, error } = await supabase.from("profiles").select("*");
  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return profiles.map((p: any) => ({
    id: p.id,
    email: p.email,
    role: p.role,
    isProfileComplete: p.is_profile_complete,
    profile: p.is_profile_complete ? {
      nim: p.nim,
      namaLengkap: p.nama_lengkap,
      fakultas: p.fakultas,
      prodi: p.prodi,
      angkatan: p.angkatan,
      email: p.email,
      noHp: p.no_hp,
    } : undefined,
  }));
}

export async function updateUser(id: string, updates: Partial<StoredUser>) {
  // If we're updating profile info
  if (updates.profile || updates.isProfileComplete !== undefined) {
    const dbUpdate: any = {};
    if (updates.isProfileComplete !== undefined) dbUpdate.is_profile_complete = updates.isProfileComplete;
    if (updates.profile) {
      dbUpdate.nim = updates.profile.nim;
      dbUpdate.nama_lengkap = updates.profile.namaLengkap;
      dbUpdate.fakultas = updates.profile.fakultas;
      dbUpdate.prodi = updates.profile.prodi;
      dbUpdate.angkatan = updates.profile.angkatan;
      dbUpdate.email = updates.profile.email;
      dbUpdate.no_hp = updates.profile.noHp;
    }
    await supabase.from("profiles").update(dbUpdate).eq("id", id);
  }
}

export async function deleteUser(id: string) {
  // Can only delete via Supabase Admin API for auth.users, but we can delete the profile
  await supabase.from("profiles").delete().eq("id", id);
}

// ---- Session ----

export async function getSession(): Promise<UserSession | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
  
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    isProfileCompleted: profile.is_profile_complete,
    profile: profile.is_profile_complete ? {
      nim: profile.nim,
      namaLengkap: profile.nama_lengkap,
      fakultas: profile.fakultas,
      prodi: profile.prodi,
      angkatan: profile.angkatan,
      email: profile.email,
      noHp: profile.no_hp,
    } : undefined,
  };
}

export async function clearSession() {
  await supabase.auth.signOut();
}

// ---- Login / Register ----

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: UserSession }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  
  const s = await getSession();
  if (!s) return { success: false, error: "Profile not found" };

  return { success: true, session: s };
}

export async function registerMahasiswa(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  
  // Create profile
  if (data.user) {
    await supabase.from("profiles").insert([{
      id: data.user.id,
      email: data.user.email,
      role: "mahasiswa",
      is_profile_complete: false
    }]);
  }

  return { success: true };
}

export async function completeProfile(userId: string, profile: UserProfile) {
  await updateUser(userId, { profile, isProfileComplete: true });
}

export async function refreshSession(): Promise<UserSession | null> {
  return await getSession();
}
