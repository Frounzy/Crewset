-- Ensure ON DELETE CASCADE for all user-related tables to support account deletion

-- Contracts
ALTER TABLE public.contracts
DROP CONSTRAINT IF EXISTS contracts_user_id_fkey,
ADD CONSTRAINT contracts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Clients
ALTER TABLE public.clients
DROP CONSTRAINT IF EXISTS clients_user_id_fkey,
ADD CONSTRAINT clients_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Subscriptions
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey,
ADD CONSTRAINT subscriptions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Contract Activities
ALTER TABLE public.contract_activities
DROP CONSTRAINT IF EXISTS contract_activities_user_id_fkey,
ADD CONSTRAINT contract_activities_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Portfolio Items
ALTER TABLE public.portfolio_items
DROP CONSTRAINT IF EXISTS portfolio_items_user_id_fkey,
ADD CONSTRAINT portfolio_items_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Profiles
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
