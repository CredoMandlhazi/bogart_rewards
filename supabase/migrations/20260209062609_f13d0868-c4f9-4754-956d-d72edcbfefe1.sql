-- Create app_role enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');

-- Create tier enum
CREATE TYPE public.loyalty_tier AS ENUM ('silver', 'gold', 'platinum');

-- Create user_roles table (security best practice - roles separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT UNIQUE,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  id_number_hash TEXT UNIQUE,
  birthday DATE,
  preferred_store_id UUID,
  clothing_sizes JSONB DEFAULT '{}',
  gender_preference TEXT,
  style_interests TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create loyalty_accounts table
CREATE TABLE public.loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  member_id TEXT NOT NULL UNIQUE,
  barcode_value TEXT NOT NULL UNIQUE,
  current_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  current_tier loyalty_tier NOT NULL DEFAULT 'silver',
  tier_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  max_discount_unlocked INTEGER NOT NULL DEFAULT 0,
  referred_by_staff_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;

-- Create points_ledger table
CREATE TABLE public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_account_id UUID REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'bonus', 'tier_bonus', 'expired', 'adjustment')),
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  store_id UUID,
  staff_code TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

-- Create stores table
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  opening_hours JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Create staff_referrals table
CREATE TABLE public.staff_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  staff_code TEXT NOT NULL UNIQUE,
  store_id UUID REFERENCES public.stores(id),
  total_signups INTEGER NOT NULL DEFAULT 0,
  total_sales_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_commission_earned DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_referrals ENABLE ROW LEVEL SECURITY;

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_account_id UUID REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES public.stores(id),
  staff_code TEXT,
  receipt_reference TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  discount_applied DECIMAL(12,2) NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  items_summary JSONB DEFAULT '[]',
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  discount_value TEXT NOT NULL,
  category TEXT NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  min_tier loyalty_tier,
  min_points INTEGER DEFAULT 0,
  is_member_only BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create rewards table
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  points_cost INTEGER NOT NULL,
  category TEXT NOT NULL,
  min_tier loyalty_tier,
  stock_quantity INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Create redemptions table
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_account_id UUID REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES public.rewards(id),
  deal_id UUID REFERENCES public.deals(id),
  redemption_code TEXT NOT NULL UNIQUE,
  points_spent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  used_at TIMESTAMP WITH TIME ZONE,
  used_at_store_id UUID REFERENCES public.stores(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Create auth_verifications table for OTP
CREATE TABLE public.auth_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('phone', 'email')),
  otp_code TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.auth_verifications ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT true,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  whatsapp_opt_in_date TIMESTAMP WITH TIME ZONE,
  promo_notifications BOOLEAN NOT NULL DEFAULT true,
  points_notifications BOOLEAN NOT NULL DEFAULT true,
  tier_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create helper function for role checking (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to generate unique member ID
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'BGM' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to generate unique barcode
CREATE OR REPLACE FUNCTION public.generate_barcode()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := LPAD(FLOOR(RANDOM() * 10000000000000)::TEXT, 13, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_accounts_updated_at BEFORE UPDATE ON public.loyalty_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_referrals_updated_at BEFORE UPDATE ON public.staff_referrals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- user_roles: users can read their own roles, admins can manage all
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles: users can manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'staff'));

-- loyalty_accounts: users can view their own, staff/admin can view all
CREATE POLICY "Users can view own loyalty account" ON public.loyalty_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loyalty account" ON public.loyalty_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loyalty account" ON public.loyalty_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all loyalty accounts" ON public.loyalty_accounts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view all loyalty accounts" ON public.loyalty_accounts FOR SELECT USING (public.has_role(auth.uid(), 'staff'));

-- points_ledger: users can view their own points history
CREATE POLICY "Users can view own points" ON public.points_ledger FOR SELECT USING (
  loyalty_account_id IN (SELECT id FROM public.loyalty_accounts WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage points" ON public.points_ledger FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can insert points" ON public.points_ledger FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'staff'));

-- stores: public read, admin manage
CREATE POLICY "Anyone can view active stores" ON public.stores FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage stores" ON public.stores FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- staff_referrals: staff can view their own, admin can manage all
CREATE POLICY "Staff can view own referrals" ON public.staff_referrals FOR SELECT USING (auth.uid() = staff_user_id);
CREATE POLICY "Admins can manage all referrals" ON public.staff_referrals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- purchases: users can view their own
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (
  loyalty_account_id IN (SELECT id FROM public.loyalty_accounts WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage purchases" ON public.purchases FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can insert purchases" ON public.purchases FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'staff'));

-- deals: public read active, admin manage
CREATE POLICY "Anyone can view active deals" ON public.deals FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage deals" ON public.deals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- rewards: public read active, admin manage
CREATE POLICY "Anyone can view active rewards" ON public.rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage rewards" ON public.rewards FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- redemptions: users can view/create their own
CREATE POLICY "Users can view own redemptions" ON public.redemptions FOR SELECT USING (
  loyalty_account_id IN (SELECT id FROM public.loyalty_accounts WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own redemptions" ON public.redemptions FOR INSERT WITH CHECK (
  loyalty_account_id IN (SELECT id FROM public.loyalty_accounts WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage redemptions" ON public.redemptions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can update redemptions" ON public.redemptions FOR UPDATE USING (public.has_role(auth.uid(), 'staff'));

-- auth_verifications: public insert for OTP, no direct access after
CREATE POLICY "Anyone can create verification" ON public.auth_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view verifications" ON public.auth_verifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- notifications: users can view/update their own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- audit_logs: admin only
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- notification_preferences: users can manage their own
CREATE POLICY "Users can view own preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample stores data
INSERT INTO public.stores (name, address, city, province, phone, is_active) VALUES
('Bogart Man Sandton City', 'Sandton City Mall, Sandton', 'Johannesburg', 'Gauteng', '+27 11 784 0123', true),
('Bogart Man Mall of Africa', 'Mall of Africa, Midrand', 'Johannesburg', 'Gauteng', '+27 11 253 0456', true),
('Bogart Man Gateway', 'Gateway Theatre of Shopping, Umhlanga', 'Durban', 'KwaZulu-Natal', '+27 31 566 0789', true),
('Bogart Man V&A Waterfront', 'V&A Waterfront', 'Cape Town', 'Western Cape', '+27 21 418 0123', true),
('Bogart Man Menlyn', 'Menlyn Park Shopping Centre', 'Pretoria', 'Gauteng', '+27 12 348 0456', true),
('Bogart Man Eastgate', 'Eastgate Shopping Centre, Bedfordview', 'Johannesburg', 'Gauteng', '+27 11 622 0789', true);

-- Insert sample deals
INSERT INTO public.deals (title, description, discount_value, category, valid_until, is_member_only, is_active) VALUES
('Bogart Classic Tipped Polo', 'Premium polo collection with signature tipped collar design.', '25% OFF', 'Polos', now() + interval '30 days', true, true),
('Vintage Wash Denim', 'Bogart embroidered vintage wash denim with authentic distressed finish.', '20% OFF', 'Denim', now() + interval '14 days', true, true),
('Premium Accessories', 'Designer watches, leather belts, and premium accessories.', '30% OFF', 'Accessories', now() + interval '45 days', false, true),
('New Season Preview', 'Be the first to shop our Spring/Summer collection.', '15% OFF', 'T-Shirts', now() + interval '21 days', true, true),
('Bogart Sweaters', 'Royal Crest and Mankind collection sweaters.', '35% OFF', 'Sweaters', now() + interval '10 days', true, true);

-- Insert sample rewards
INSERT INTO public.rewards (title, description, points_cost, category, is_active) VALUES
('R250 Store Credit', 'Redeem for R250 off your next in-store or online purchase.', 2500, 'Credit', true),
('R500 Store Credit', 'Get R500 off any purchase of R1,000 or more.', 5000, 'Credit', true),
('Free Premium Accessory', 'Choose any accessory up to R750 value from our premium collection.', 7500, 'Product', true),
('R1,000 Store Credit', 'Major savings on your premium menswear purchases.', 10000, 'Credit', true),
('Personal Styling Session', 'One-on-one session with our expert stylists at any flagship store.', 15000, 'Experience', true),
('VIP Collection Preview', 'Exclusive access to new collection before public release.', 20000, 'Experience', true);