
-- Add inventory and bulk pricing columns to rooms
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS inventory_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS group_discount_threshold integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS group_discount_percent numeric NOT NULL DEFAULT 10;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  phone text,
  role text NOT NULL DEFAULT 'guest',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Trigger on auth.users (allowed via security definer)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check room inventory before booking
CREATE OR REPLACE FUNCTION public.check_room_inventory(_room_id uuid, _check_in date, _check_out date)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 
    (SELECT inventory_count FROM public.rooms WHERE id = _room_id) -
    (SELECT COUNT(*) FROM public.bookings 
     WHERE room_id = _room_id 
       AND status IN ('pending', 'confirmed')
       AND daterange(check_in, check_out, '[)') && daterange(_check_in, _check_out, '[)'))
  );
$$;
