import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LoyaltyCard from "@/components/LoyaltyCard";
import PromoCard from "@/components/PromoCard";
import SectionHeader from "@/components/SectionHeader";
import TierProgress from "@/components/TierProgress";
import PointsHistory from "@/components/PointsHistory";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { getPointsHistory } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

import heroLifestyle from "@/assets/hero-lifestyle.jpg";
import promoPolo from "@/assets/promo-polo.jpg";
import promoBackpack from "@/assets/promo-backpack.jpg";

// Unique images for DB deals on homepage
import promoFragrance from "@/assets/promo-fragrance.jpg";
import promoSneakers from "@/assets/promo-sneakers.jpg";
import promoCargo from "@/assets/promo-cargo.jpg";
import promoBag from "@/assets/promo-bag.jpg";

const homeDealImages = [promoFragrance, promoSneakers, promoCargo, promoBag];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface PointsTransaction {
  id: string;
  type: "earned" | "redeemed" | "bonus" | "tier_bonus";
  description: string;
  points: number;
  date: string;
  storeName?: string;
}

const mapTransactionType = (type: string): PointsTransaction["type"] => {
  if (type === "earn" || type === "earned") return "earned";
  if (type === "redeem" || type === "redeemed") return "redeemed";
  if (type === "bonus") return "bonus";
  if (type === "tier_bonus") return "tier_bonus";
  return "earned";
};

const Index = () => {
  const navigate = useNavigate();
  const { profile, loyaltyAccount, user } = useAuth();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    if (!loyaltyAccount?.id) return;
    getPointsHistory(loyaltyAccount.id, 3).then((data) => {
      if (data) {
        setTransactions(
          data.map((t) => ({
            id: t.id,
            type: mapTransactionType(t.transaction_type),
            description: t.description,
            points: t.points,
            date: format(new Date(t.created_at), "dd MMM"),
          }))
        );
      }
    });
  }, [loyaltyAccount?.id]);

  useEffect(() => {
    supabase
      .from("deals")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setDeals(data);
      });
  }, []);

  const displayName = profile?.full_name?.split(" ")[0] || "Member";
  const tierThresholds: Record<string, { next: "gold" | "platinum"; points: number }> = {
    silver: { next: "gold", points: 25000 },
    gold: { next: "platinum", points: 50000 },
  };
  const currentTier = loyaltyAccount?.current_tier || "silver";
  const tierInfo = tierThresholds[currentTier];

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <Logo size="md" showTitle />
            <p className="text-[10px] text-muted-foreground tracking-wider">
              Welcome back, {displayName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => navigate("/barcode")}>
              <Scan className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      <motion.main variants={containerVariants} initial="hidden" animate="visible" className="px-5 py-6 space-y-8">
        {/* Loyalty Card */}
        <motion.section variants={itemVariants}>
          {loyaltyAccount ? (
            <LoyaltyCard
              memberName={profile?.full_name || "Member"}
              memberId={loyaltyAccount.member_id}
              points={loyaltyAccount.current_points}
              tier={loyaltyAccount.current_tier}
            />
          ) : (
            <div className="card-premium rounded-2xl p-6 text-center">
              <p className="text-muted-foreground">Your loyalty card will appear here once activated.</p>
            </div>
          )}
        </motion.section>

        {/* Hero Promo */}
        <motion.section variants={itemVariants}>
          <PromoCard image={heroLifestyle} title="New Season Collection" subtitle="Explore the latest arrivals" badge="Latest Drop" isLarge href="https://www.bogartman.com/" />
        </motion.section>

        {/* Tier Progress */}
        {loyaltyAccount && (
          <motion.section variants={itemVariants}>
            <TierProgress
              currentTier={currentTier}
              currentPoints={loyaltyAccount.lifetime_points}
              nextTierPoints={tierInfo?.points}
              nextTier={tierInfo?.next}
            />
          </motion.section>
        )}

        {/* Featured Deals from DB */}
        {deals.length > 0 && (
          <motion.section variants={itemVariants}>
            <SectionHeader title="Member Exclusives" subtitle="Curated just for you" linkTo="/deals" />
            <div className="grid grid-cols-2 gap-4">
              {deals.slice(0, 2).map((deal, index) => (
                <PromoCard
                  key={deal.id}
                  image={deal.image_url || homeDealImages[index % homeDealImages.length]}
                  title={deal.title}
                  discount={deal.discount_value}
                  badge={deal.is_member_only ? "Members" : undefined}
                  href="https://www.bogartman.com/"
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Static promo cards as brand content */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Trending Now" subtitle="Fresh styles in store" linkTo="/deals" />
          <div className="grid grid-cols-2 gap-4">
            <PromoCard image={promoPolo} title="Premium Polos" href="https://www.bogartman.com/" />
            <PromoCard image={promoBackpack} title="Luxury Accessories" badge="New" href="https://www.bogartman.com/" />
          </div>
        </motion.section>

        {/* Recent Activity */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Points Activity" subtitle="Your recent transactions" />
          {transactions.length > 0 ? (
            <PointsHistory transactions={transactions} />
          ) : (
            <div className="card-premium rounded-lg p-6 text-center">
              <p className="text-muted-foreground text-sm">No points activity yet. Start shopping to earn points!</p>
            </div>
          )}
        </motion.section>
      </motion.main>
    </div>
  );
};

export default Index;
