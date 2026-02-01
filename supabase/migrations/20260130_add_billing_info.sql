-- Add billing info columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS billing_company_name text,
ADD COLUMN IF NOT EXISTS billing_tax_id text,
ADD COLUMN IF NOT EXISTS billing_tax_office text,
ADD COLUMN IF NOT EXISTS billing_address text;
