-- =====================================================
-- Schema: Sistem Pendataan PMK dan Skripsi - UNISBA
-- Database: PostgreSQL (Supabase / Neon)
-- Updated to match business flow v2
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS (dikelola oleh Supabase Auth)
-- =====================================================
-- auth.users dikelola otomatis oleh Supabase.
-- Tabel di bawah adalah profil tambahan yang diisi mahasiswa saat pertama login.

CREATE TABLE public.profiles (
    id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nim         VARCHAR(50) UNIQUE,
    nama_lengkap VARCHAR(255),
    fakultas    VARCHAR(100) DEFAULT 'Ekonomi',
    prodi       VARCHAR(100),
    angkatan    VARCHAR(10),
    email       VARCHAR(255),
    no_hp       VARCHAR(20),
    role        VARCHAR(20) DEFAULT 'mahasiswa' CHECK (role IN ('mahasiswa', 'admin')),
    is_profile_complete BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. DATA PMK
-- =====================================================

CREATE TABLE public.pmk_documents (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
    nim             VARCHAR(50) NOT NULL,
    nama_mahasiswa  VARCHAR(255) NOT NULL,
    fakultas        VARCHAR(100) DEFAULT 'Ekonomi',
    prodi           VARCHAR(100) NOT NULL,
    angkatan        VARCHAR(10),
    tahun           INT         NOT NULL,
    judul           TEXT        NOT NULL,
    gdrive_file_id  VARCHAR(255),               -- ID file PDF di Google Drive
    status          VARCHAR(50) DEFAULT 'Diajukan'
                    CHECK (status IN ('Diajukan', 'Diterima', 'Ditolak')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. DATA SKRIPSI
-- =====================================================

CREATE TABLE public.skripsi_documents (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
    nim             VARCHAR(50) NOT NULL,
    nama_mahasiswa  VARCHAR(255) NOT NULL,
    fakultas        VARCHAR(100) DEFAULT 'Ekonomi',
    prodi           VARCHAR(100) NOT NULL,
    angkatan        VARCHAR(10),
    tahun           INT         NOT NULL,
    judul           TEXT        NOT NULL,
    pembimbing_1    VARCHAR(255) NOT NULL,
    pembimbing_2    VARCHAR(255),
    gdrive_file_id  VARCHAR(255),               -- ID file PDF di Google Drive
    status          VARCHAR(50) DEFAULT 'Diajukan'
                    CHECK (status IN ('Diajukan', 'Diterima', 'Ditolak', 'Lulus')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmk_documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skripsi_documents ENABLE ROW LEVEL SECURITY;

-- Helper function: cek apakah user adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: User bisa lihat/edit profilnya sendiri. Admin bisa akses semua.
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- PMK: Semua yang login bisa lihat. Mahasiswa hanya bisa insert & update miliknya. Admin bebas.
CREATE POLICY "pmk_select_all_logged_in" ON public.pmk_documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "pmk_insert_own" ON public.pmk_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pmk_update_own" ON public.pmk_documents
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "pmk_delete_admin_only" ON public.pmk_documents
  FOR DELETE USING (public.is_admin());

-- Skripsi: Sama seperti PMK
CREATE POLICY "skripsi_select_all_logged_in" ON public.skripsi_documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "skripsi_insert_own" ON public.skripsi_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skripsi_update_own" ON public.skripsi_documents
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "skripsi_delete_admin_only" ON public.skripsi_documents
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- 5. AUTO-UPDATE updated_at TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_pmk
  BEFORE UPDATE ON public.pmk_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_skripsi
  BEFORE UPDATE ON public.skripsi_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- 6. ENV VARIABLES (.env.local)
-- =====================================================
-- NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxx
-- GDRIVE_FOLDER_ID=xxxxxxxxxxxx      (ID folder Google Drive Fakultas)
-- GDRIVE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com
-- GDRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
