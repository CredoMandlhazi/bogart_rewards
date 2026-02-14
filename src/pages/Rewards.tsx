import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Ticket, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RewardCard from "@/components/RewardCard";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getRedemptions } from "@/lib/supabase-helpers";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  category: string;
}

interface Redemption {
  id: string;
  redemption_code: string;
  status: string;
  expires_at: string;
  created_at: string;
  used_at: string | null;
  rewards?: { title: string } | null;
  deals?: { title: string } | null;
}

const Rewards = () => {
  const { loyaltyAccount } = useAuth();
  const [activeTab, setActiveTab] = useState("catalog");
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentPoints = loyaltyAccount?.current_points || 0;

  useEffect(() => {
    const fetchRewards = async () => {
      setIsLoading(true);
      const { data } = await supabase.from("rewards").select("*").eq("is_active", true).order("points_cost", { ascending: true });
      if (data) setRewards(data);
      setIsLoading(false);
    };
    fetchRewards();
  }, []);

  useEffect(() => {
    if (!loyaltyAccount?.id) return;
    getRedemptions(loyaltyAccount.id).then((data) => {
      if (data) setRedemptions(data as unknown as Redemption[]);
    });
  }, [loyaltyAccount?.id]);

  const activeRedemptions = redemptions.filter((r) => r.status === "active");
  const usedRedemptions = redemptions.filter((r) => r.status === "used");

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl tracking-wide text-foreground">REWARDS</h1>
              <p className="text-sm text-muted-foreground">Redeem your points</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Available Points</p>
              <p className="text-xl font-display tracking-wide text-gradient-gold">{currentPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="px-5 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="catalog" className="data-[state=active]:bg-card"><Gift className="w-4 h-4 mr-2" />Catalog</TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-card"><Ticket className="w-4 h-4 mr-2" />My Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="card-premium rounded-xl p-4 animate-pulse">
                    <div className="aspect-video bg-muted rounded-lg mb-4" />
                    <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : rewards.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">No rewards available yet</p>
                <p className="text-sm text-muted-foreground mt-1">Keep earning points — rewards are coming soon!</p>
              </motion.div>
            ) : (
              <div>
                <SectionHeader title="Available Rewards" subtitle="Redeem points for exclusive perks" />
                <div className="grid grid-cols-1 gap-4">
                  {rewards.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      title={reward.title}
                      description={reward.description || ""}
                      pointsCost={reward.points_cost}
                      currentPoints={currentPoints}
                      image={reward.image_url || undefined}
                      category={reward.category}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wallet" className="mt-6 space-y-4">
            <SectionHeader title="Your Rewards" subtitle="Redeemed rewards and vouchers" />
            {redemptions.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No redeemed rewards yet</p>
                <Button variant="ghost" className="mt-4 text-accent" onClick={() => setActiveTab("catalog")}>Browse Rewards</Button>
              </div>
            ) : (
              redemptions.map((r, index) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`card-premium rounded-xl p-4 ${r.status === "used" ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-lg tracking-wide text-foreground">{r.rewards?.title || r.deals?.title || "Reward"}</h3>
                      <p className="text-xs text-muted-foreground">Redeemed {new Date(r.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {r.status === "active" ? "Active" : "Used"}
                    </span>
                  </div>
                  {r.status === "active" && (
                    <>
                      <div className="bg-secondary rounded-lg p-3 mb-3">
                        <p className="text-center font-mono text-lg font-bold text-foreground tracking-wider">{r.redemption_code}</p>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Expires {new Date(r.expires_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Rewards;
