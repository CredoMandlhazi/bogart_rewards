-- Fix overly permissive RLS policies
-- Drop the permissive policies
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can create verification" ON public.auth_verifications;

-- Create more restrictive policies for audit_logs
-- Only authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Auth verifications need to be accessible during signup flow
-- Allow insert but restrict to valid identifiers
CREATE POLICY "System can create verification" ON public.auth_verifications 
  FOR INSERT WITH CHECK (
    identifier IS NOT NULL 
    AND identifier_type IN ('phone', 'email')
    AND LENGTH(otp_code) = 6
  );