-- Add contract template column for seller-defined contract text
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS contract_template text;
