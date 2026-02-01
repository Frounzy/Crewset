-- Bu SQL dosyasını Supabase Dashboard > SQL Editor kısmında çalıştırın.
-- Bu script, kullanıcı kayıt olduğunda çalışan trigger'ı onarır ve "Database error saving new user" hatasını çözer.

-- 1. Önce mevcut trigger'ı kaldır (Çakışmayı önlemek için)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Fonksiyonu daha sağlam (robust) hale getir
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
    -- Google metadata genellikle 'full_name', 'name' veya 'picture' içerir. Hepsini kontrol edelim.
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      ''
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url', 
      new.raw_user_meta_data->>'picture', 
      ''
    )
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
    -- Hata durumunda işlemi durdurma, sadece logla (Kullanıcı giriş yapabilsin, profil sonra düzeltilir)
    RAISE WARNING 'handle_new_user trigger hatası: %', SQLERRM;
    RETURN new;
END;
$$;

-- 3. Trigger'ı yeniden oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Varsa eksik profilleri tamamla (Geriye dönük düzeltme)
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
