import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const nameSchema = z.string().min(2, "Name must be at least 2 characters").max(100);
const phoneSchema = z.string().regex(/^(\+27|0)\d{9}$/, "Enter a valid SA phone number (e.g. +27821234567)").or(z.literal(""));

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { profile, user, refreshUserData } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state from profile whenever it changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    try { nameSchema.parse(fullName.trim()); } catch (e) {
      if (e instanceof z.ZodError) newErrors.fullName = e.errors[0].message;
    }
    if (phone.trim()) {
      try { phoneSchema.parse(phone.trim()); } catch (e) {
        if (e instanceof z.ZodError) newErrors.phone = e.errors[0].message;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validate()) return;

    setIsSaving(true);
    try {
      // Use upsert to handle case where profile doesn't exist yet
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          email: user.email || "",
        }, { onConflict: "user_id" })
        .select();

      if (error) {
        if (error.message.includes("duplicate") || error.code === "23505") {
          toast({ title: "Error", description: "This phone number is already linked to another account.", variant: "destructive" });
        } else {
          throw error;
        }
        return;
      }

      if (!data || data.length === 0) {
        toast({ title: "Error", description: "Could not save profile. Please try again.", variant: "destructive" });
        return;
      }

      // Re-fetch profile from server to confirm persistence
      await refreshUserData();
      toast({ title: "Profile updated", description: "Your information has been saved successfully." });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ title: "Error", description: "Could not update profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="flex items-center gap-3 px-5 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-foreground">PERSONAL INFO</h1>
            <p className="text-sm text-muted-foreground">Manage your details</p>
          </div>
        </div>
      </motion.header>

      <main className="px-5 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" placeholder="Enter your full name" />
            </div>
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" value={profile?.email || user?.email || ""} disabled className="pl-10 opacity-60" />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" placeholder="+27821234567" />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full btn-gold">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>

        {/* Read-only section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium rounded-xl p-5 space-y-3">
          <h3 className="font-display text-lg tracking-wide text-foreground">Account Details</h3>
          <p className="text-xs text-muted-foreground">These details cannot be edited</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Member ID</span><span className="font-mono text-foreground">{profile ? "Linked" : "Not set"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ID Verified</span><span className="text-foreground">{profile?.id_number_hash ? "Yes" : "No"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone Verified</span><span className="text-foreground">{profile?.phone_verified ? "Yes" : "No"}</span></div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PersonalInfo;
