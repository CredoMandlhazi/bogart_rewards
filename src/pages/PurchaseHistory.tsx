import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, MapPin, Calendar, Receipt, TrendingUp, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPurchaseHistory } from "@/lib/supabase-helpers";
import { format } from "date-fns";

interface PurchaseItem {
  name: string;
  quantity: number;
}

interface Purchase {
  id: string;
  receipt_reference: string;
  total_amount: number;
  discount_applied: number;
  points_earned: number;
  items_summary: PurchaseItem[];
  purchase_date: string;
  stores?: { name: string; address: string; city: string } | null;
}

const PurchaseHistory = () => {
  const { loyaltyAccount, isLoading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!loyaltyAccount?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await getPurchaseHistory(loyaltyAccount.id);
        if (data && data.length > 0) {
          setPurchases(
            data.map((p) => ({
              ...p,
              items_summary: Array.isArray(p.items_summary) ? (p.items_summary as unknown as PurchaseItem[]) : [],
            })) as Purchase[]
          );
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchases();
  }, [loyaltyAccount?.id]);

  const totalSpent = purchases.reduce((sum, p) => sum + p.total_amount, 0);
  const totalPoints = purchases.reduce((sum, p) => sum + p.points_earned, 0);
  const totalSaved = purchases.reduce((sum, p) => sum + p.discount_applied, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="px-5 py-4">
          <h1 className="font-display text-3xl tracking-wide text-foreground">PURCHASE HISTORY</h1>
          <p className="text-sm text-muted-foreground">Your recent transactions</p>
        </div>
      </motion.header>

      <main className="px-5 py-6 space-y-6">
        {isLoading || authLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium rounded-xl p-4 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">No purchases yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start shopping to see your history here</p>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
              <div className="card-premium rounded-lg p-4 text-center">
                <ShoppingBag className="w-5 h-5 mx-auto mb-2 text-accent" />
                <p className="text-lg font-display tracking-wide text-foreground">{purchases.length}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div className="card-premium rounded-lg p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-2 text-accent" />
                <p className="text-lg font-display tracking-wide text-foreground">{totalPoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Points Earned</p>
              </div>
              <div className="card-premium rounded-lg p-4 text-center">
                <Receipt className="w-5 h-5 mx-auto mb-2 text-accent" />
                <p className="text-lg font-display tracking-wide text-foreground">R{totalSaved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Saved</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-elevated rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-1">Lifetime Spend</p>
              <p className="text-3xl font-display tracking-wide text-gradient-gold">R{totalSpent.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
            </motion.div>

            <div className="space-y-4">
              <h2 className="font-display text-xl tracking-wide text-foreground">Transactions</h2>
              {purchases.map((purchase, index) => (
                <motion.div key={purchase.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="card-premium rounded-xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setSelectedPurchase(selectedPurchase?.id === purchase.id ? null : purchase)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">{purchase.receipt_reference}</p>
                      <p className="font-display text-xl tracking-wide text-foreground">R{purchase.total_amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-accent">+{purchase.points_earned} pts</span>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground ml-auto mt-1 transition-transform ${selectedPurchase?.id === purchase.id ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {purchase.stores && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{purchase.stores.name}</div>}
                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(new Date(purchase.purchase_date), "dd MMM yyyy")}</div>
                  </div>
                  {selectedPurchase?.id === purchase.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Items Purchased</p>
                      <div className="space-y-1">
                        {purchase.items_summary.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.name}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {purchase.discount_applied > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Discount Applied</span>
                            <span className="text-accent">-R{purchase.discount_applied.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PurchaseHistory;
