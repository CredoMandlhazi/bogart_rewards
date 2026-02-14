// src/integrations/supabase/helpers.ts
import { supabase } from "./client";

/**
 * Create a user profile and a loyalty account with debug logs
 * @param userId Supabase auth user ID
 * @param data Profile data
 */
export const createUserProfile = async (
  userId: string,
  data: {
    fullName: string;
    email: string;
    phone?: string;
    idNumberHash?: string;
    staffCode?: string;
  }
) => {
  try {
    console.log("[createUserProfile] Starting for userId:", userId);

    // 1️⃣ Insert into profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        id_number_hash: data.idNumberHash ?? null,
        staff_code: data.staffCode ?? null,
        created_at: new Date(),
      })
      .select() // returns the inserted row(s)
      .single();

    if (profileError) throw profileError;

    console.log("[createUserProfile] Profile created:", profileData);

    // 2️⃣ Automatically create a loyalty account row
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from("loyalty_accounts")
      .insert({
        user_id: userId,
        points: 0,
        tier: "Bronze",
        created_at: new Date(),
      })
      .select()
      .single();

    if (loyaltyError) throw loyaltyError;

    console.log("[createUserProfile] Loyalty account created:", loyaltyData);

    return { profile: profileData, loyalty: loyaltyData };
  } catch (err: any) {
    console.error("[createUserProfile] Error:", err.message);
    throw err;
  }
};
