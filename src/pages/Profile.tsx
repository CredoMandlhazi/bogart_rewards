import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Bell, ShoppingBag, ChevronRight, Settings, HelpCircle, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TierProgress from "@/components/TierProgress";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: User, label: "Personal Information", description: "Name, email, phone, preferences", path: "/profile/info" },
  { icon: ShoppingBag, label: "Purchase History", description: "View past orders and receipts", path: "/purchases" },
  { icon: Bell, label: "Notifications", description: "Manage your preferences", path: "/profile/notifications" },
  { icon: Settings, label: "Settings", description: "App preferences and security", path: "/profile/settings" },
  { icon: HelpCircle, label: "Help & Support", description: "FAQs and contact support", path: "/profile/help" },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loyaltyAccount, signOut } = useAuth();

  const displayName = profile?.full_name || "Member";
  const displayEmail = profile?.email || user?.email || "";
  const tier = loyaltyAccount?.current_tier || "silver";
  const lifetimePoints = loyaltyAccount?.lifetime_points || 0;

  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const tierLabels = { silver: "Silver", gold: "Gold", platinum: "Platinum" };
  const tierClasses = { silver: "tier-silver", gold: "tier-gold", platinum: "tier-platinum" };

  const tierThresholds: Record<string, { next: "gold" | "platinum"; points: number }> = {
    silver: { next: "gold", points: 25000 },
    gold: { next: "platinum", points: 50000 },
  };
  const tierInfo = tierThresholds[tier];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-ZA", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-dark pt-12 pb-8 px-5 safe-top">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-20 h-20 border-2 border-accent">
            <AvatarFallback className="bg-secondary text-foreground text-2xl font-display">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-white">{displayName}</h1>
            <p className="text-sm text-white/70">{displayEmail}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`tier-badge ${tierClasses[tier]}`}>
                <Crown className="w-3 h-3" />
                {tierLabels[tier]} Member
              </div>
            </div>
          </div>
        </div>
        {memberSince && <p className="text-xs text-white/50">Member since {memberSince}</p>}
      </motion.header>

      <main className="px-5 py-6 space-y-6">
        {loyaltyAccount && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <TierProgress currentTier={tier} currentPoints={lifetimePoints} nextTierPoints={tierInfo?.points} nextTier={tierInfo?.next} />
          </motion.section>
        )}

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="w-full card-premium rounded-xl p-4 flex items-center gap-4 text-left hover:bg-secondary/50 transition-colors"
                onClick={() => navigate(item.path)}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </motion.button>
            );
          })}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </motion.section>

        <p className="text-center text-xs text-muted-foreground pt-4">Bogart Man v1.0.0</p>
      </main>
    </div>
  );
};

export default Profile;
