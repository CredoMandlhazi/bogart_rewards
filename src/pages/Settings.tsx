import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Mail, MessageSquare, Phone, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState({
    push_enabled: true,
    email_enabled: true,
    sms_enabled: true,
    whatsapp_enabled: false,
    promo_notifications: true,
    points_notifications: true,
    tier_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPrefs({
            push_enabled: data.push_enabled,
            email_enabled: data.email_enabled,
            sms_enabled: data.sms_enabled,
            whatsapp_enabled: data.whatsapp_enabled,
            promo_notifications: data.promo_notifications,
            points_notifications: data.points_notifications,
            tier_notifications: data.tier_notifications,
          });
        }
        setIsLoading(false);
      });
  }, [user]);

  const updatePref = async (key: string, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    if (!user) return;
    setIsSaving(true);
    await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, [key]: value }, { onConflict: "user_id" });
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    if (!user) return;

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw new Error(response.error.message || "Deletion failed");

      // Sign out locally and redirect
      await signOut();
      navigate("/auth");
      toast({ title: "Account deleted", description: "Your account and all data have been permanently removed." });
    } catch (error) {
      console.error("Delete account error:", error);
      toast({ title: "Error", description: "Could not delete account. Please contact support.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const settingItems = [
    { key: "push_enabled", label: "Push Notifications", description: "Receive push alerts on your device", icon: Bell },
    { key: "email_enabled", label: "Email Notifications", description: "Get updates via email", icon: Mail },
    { key: "sms_enabled", label: "SMS Notifications", description: "Receive text message alerts", icon: Phone },
    { key: "whatsapp_enabled", label: "WhatsApp Messages", description: "Get alerts via WhatsApp", icon: MessageSquare },
  ];

  const alertItems = [
    { key: "promo_notifications", label: "Promotions & Deals", description: "New offers and sales" },
    { key: "points_notifications", label: "Points Activity", description: "When you earn or redeem points" },
    { key: "tier_notifications", label: "Tier Updates", description: "Progress and tier changes" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="flex items-center gap-3 px-5 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-foreground">SETTINGS</h1>
            <p className="text-sm text-muted-foreground">App preferences</p>
          </div>
        </div>
      </motion.header>

      <main className="px-5 py-6 space-y-6">
        {/* Notification Channels */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h2 className="font-display text-lg tracking-wide text-foreground">Notification Channels</h2>
          {settingItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="card-premium rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <Label className="text-foreground">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={prefs[item.key as keyof typeof prefs]}
                  onCheckedChange={(v) => updatePref(item.key, v)}
                  disabled={isLoading}
                />
              </div>
            );
          })}
        </motion.section>

        {/* Alert Types */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <h2 className="font-display text-lg tracking-wide text-foreground">Alert Preferences</h2>
          {alertItems.map((item) => (
            <div key={item.key} className="card-premium rounded-xl p-4 flex items-center justify-between">
              <div>
                <Label className="text-foreground">{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={prefs[item.key as keyof typeof prefs]}
                onCheckedChange={(v) => updatePref(item.key, v)}
                disabled={isLoading}
              />
            </div>
          ))}
        </motion.section>

        {/* Account Actions */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <h2 className="font-display text-lg tracking-wide text-foreground">Account</h2>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { setShowDeleteDialog(true); setShowConfirmStep(false); setConfirmText(""); }}
          >
            <Trash2 className="w-5 h-5 mr-3" />
            Delete Account
          </Button>
        </motion.section>
      </main>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          {!showConfirmStep ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <DialogTitle className="text-foreground">Delete Account</DialogTitle>
                </div>
                <DialogDescription className="text-left space-y-2">
                  <p>This action is <strong>permanent and cannot be undone</strong>. Deleting your account will:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Remove your profile and personal information</li>
                    <li>Delete all accumulated loyalty points</li>
                    <li>Cancel any active rewards or vouchers</li>
                    <li>Erase your purchase history</li>
                    <li>Remove your membership permanently</li>
                  </ul>
                  <p className="font-medium text-destructive">There is no way to recover your account after deletion.</p>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button variant="destructive" className="w-full" onClick={() => setShowConfirmStep(true)}>
                  I understand, continue
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">Final Confirmation</DialogTitle>
                <DialogDescription>
                  Type <strong>DELETE</strong> below to permanently delete your account.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder='Type "DELETE" to confirm'
                className="text-center font-mono"
              />
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={confirmText !== "DELETE" || isDeleting}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? "Deleting account..." : "Permanently Delete Account"}
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => { setShowConfirmStep(false); setConfirmText(""); }}>
                  Go Back
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;