-- BU SCRIPT, "email column does not exist" HATASINI VE DİĞER EKSİK KOLONLARI DÜZELTİR.

-- 1. Profiles tablosunda 'email' kolonu yoksa ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Diğer kritik kolonları da kontrol et
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS bio text;

-- 3. Mevcut kayıtlar için email bilgisini auth.users tablosundan güncelle
-- (Eğer email kolonu yeni eklendiyse içi boştur, dolduralım)
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id
AND (p.email IS NULL OR p.email = '');

-- 4. Trigger Fonksiyonunu Güncelle (Hata veren kısmı düzeltilmiş hali)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name 
      ELSE profiles.full_name 
    END,
    avatar_url = CASE 
      WHEN profiles.avatar_url IS NULL OR profiles.avatar_url = '' THEN EXCLUDED.avatar_url 
      ELSE profiles.avatar_url 
    END,
    updated_at = now();
    
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger hatası: %', SQLERRM;
    RETURN new;
END;
$$;

-- 5. Trigger'ı yeniden bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Eksik profilleri tekrar oluşturmayı dene
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
