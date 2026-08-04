import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, nama_lengkap, nim, prodi, angkatan, no_hp } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server missing Supabase credentials" }, { status: 500 });
    }

    // Gunakan admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // === SECURITY CHECK ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    const { data: { user: currentUser }, error: getUserError } = await supabaseAdmin.auth.getUser(token);
    
    if (getUserError || !currentUser) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();
      
    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can perform this action" }, { status: 403 });
    }
    // === END SECURITY CHECK ===

    // 1. Buat User di sistem Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      // 2. Buat profil di public.profiles
      const { error: profileError } = await supabaseAdmin.from("profiles").insert([{
        id: authData.user.id,
        email: authData.user.email,
        role: role || "mahasiswa",
        nama_lengkap: nama_lengkap || null,
        nim: nim || null,
        prodi: prodi || null,
        angkatan: angkatan || null,
        no_hp: no_hp || null,
        is_profile_complete: !!nama_lengkap, // anggap lengkap jika ada nama
      }]);

      if (profileError) {
        // Jika insert profile gagal, hapus akun authnya biar bersih
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: "Gagal membuat profil: " + profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Berhasil menambahkan akun" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server missing Supabase credentials" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    const { data: { user: currentUser }, error: getUserError } = await supabaseAdmin.auth.getUser(token);
    
    if (getUserError || !currentUser) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();
      
    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can perform this action" }, { status: 403 });
    }

    // Hapus dari profiles terlebih dahulu untuk menghindari error foreign key (jika ON DELETE CASCADE tidak aktif)
    const { error: deleteProfileError } = await supabaseAdmin.from("profiles").delete().eq("id", id);
    if (deleteProfileError) {
      console.warn("Warning: gagal menghapus profile", deleteProfileError);
    }

    // Hapus dari sistem Auth Supabase
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (deleteAuthError) {
      return NextResponse.json({ error: deleteAuthError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Berhasil menghapus akun" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
