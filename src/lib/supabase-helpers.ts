// src/lib/supabase-helpers.ts
import { supabase } from "@/integrations/supabase/client";
import { createUserProfile } from "@/integrations/supabase/helpers";

/* =========================
   SA ID VALIDATION
========================= */
export const validateSAIdNumber = (idNumber: string) => {
  if (!/^\d{13}$/.test(idNumber)) return false;
  const digits = idNumber.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i += 2) sum += digits[i];
  let evenSum = digits.filter((_, i) => i % 2 !== 0).join("");
  evenSum = (Number(evenSum) * 2).toString();
  sum += evenSum.split("").reduce((a, b) => a + Number(b), 0);
  return (10 - (sum % 10)) % 10 === digits[12];
};

/* =========================
   HASH ID
========================= */
export const hashIdNumber = async (idNumber: string) => {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(idNumber)
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/* =========================
   OTP
========================= */
export const generateOTPCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =========================
   PROFILE HELPERS
========================= */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

/* =========================
   LOYALTY ACCOUNT
========================= */
export async function getLoyaltyAccount(userId: string) {
  const { data, error } = await supabase
    .from("loyalty_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/* =========================
   ROLE CHECK
========================= */
export async function hasRole(userId: string, role: string) {
  const { data, error } = await supabase
    .from("staff")
    .select("role")
    .eq("id", userId)
    .eq("role", role)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/* =========================
   POINTS HISTORY
========================= */
export async function getPointsHistory(userId: string) {
  const { data, error } = await supabase
    .from("points_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error && error.code !== "PGRST116") throw error;
  return data ?? [];
}

/* =========================
   REDEMPTIONS HISTORY
========================= */
export async function getRedemptions(userId: string) {
  const { data, error } = await supabase
    .from("redemptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error && error.code !== "PGRST116") throw error;
  return data ?? [];
}

/* =========================
   PURCHASE HISTORY
========================= */
export async function getPurchaseHistory(userId: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error && error.code !== "PGRST116") throw error;
  return data ?? [];
}

/* =========================
   SIGNUP + OTP FLOW
========================= */
export const signUpUserWithOTP = async (data: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  idNumber?: string;
  staffCode?: string;
}) => {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user.");
    const userId = authData.user.id;
    let idNumberHash: string | undefined;
    if (data.idNumber) idNumberHash = await hashIdNumber(data.idNumber);
    await createUserProfile(userId, {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      idNumberHash,
      staffCode: data.staffCode,
    });
    const { error: otpError } =
      await supabase.auth.signInWithOtp({ email: data.email });
    if (otpError) throw otpError;
    return { userId, otpSent: true, message: "Signup successful! OTP email sent." };
  } catch (err: any) {
    console.error("Signup flow error:", err.message);
    throw err;
  }
};
