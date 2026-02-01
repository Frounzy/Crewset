-- 1. Tablo Yapısını Garantiye Al (Schema)
-- Profiles tablosuna eksik kolonları ekle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Portfolio Items tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  link text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Politikalarını Sıfırla ve Düzelt
-- Önce eskileri temizle (çakışmayı önlemek için)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Portfolio items viewable by everyone" ON portfolio_items;
DROP POLICY IF EXISTS "Users can insert their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can update their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON portfolio_items;

-- RLS Etkinleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Yeni Politikalar
-- Profilleri herkes görebilir (Okuma)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Kullanıcılar sadece kendi profillerini güncelleyebilir (Yazma)
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini oluşturabilir (Eğer trigger çalışmadıysa diye - Insert)
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Portföy Politikaları
CREATE POLICY "Portfolio items viewable by everyone" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Users can insert their own portfolio items" ON portfolio_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio items" ON portfolio_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolio items" ON portfolio_items FOR DELETE USING (auth.uid() = user_id);

-- 3. Eksik Profilleri Tamamla (CRITICAL FIX)
-- Auth tablosunda olup Profiles tablosunda olmayan kullanıcıları ekle
-- Bu adım çok önemli, çünkü update komutu satır yoksa sessizce başarısız olur.
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name',
  created_at,
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Mevcut Kullanıcıyı PRO Yap (Test İçin)
-- Subscriptions tablosu yoksa oluştur (Basit versiyon)
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id uuid REFERENCES auth.users PRIMARY KEY,
  plan text NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Tüm kullanıcıları PRO yap (Geliştirme aşaması olduğu için)
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'pro', 'active' FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET plan = 'pro', status = 'active';
