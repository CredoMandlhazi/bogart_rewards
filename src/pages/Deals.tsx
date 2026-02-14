import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DealCard from "@/components/DealCard";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

import promoPoloImg from "@/assets/promo-polo.jpg";
import promoFragranceImg from "@/assets/promo-fragrance.jpg";
import promoSneakersImg from "@/assets/promo-sneakers.jpg";
import promoBackpackImg from "@/assets/promo-backpack.jpg";
import promoLongsleeveImg from "@/assets/promo-longsleeve.jpg";
import promoCargoImg from "@/assets/promo-cargo.jpg";
import promoBagImg from "@/assets/promo-bag.jpg";
import promoShoesImg from "@/assets/promo-shoes.png";
import promoSandalsImg from "@/assets/promo-sandals.jpg";

// Rotate through available images — each deal gets a unique image
const dealImages = [
  promoPoloImg, promoFragranceImg, promoSneakersImg, promoBackpackImg,
  promoLongsleeveImg, promoCargoImg, promoBagImg, promoShoesImg, promoSandalsImg,
];

interface Deal {
  id: string;
  title: string;
  description: string | null;
  discount_value: string;
  valid_until: string;
  category: string;
  is_member_only: boolean;
  image_url: string | null;
}

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDeals(data);
        const cats = [...new Set(data.map((d) => d.category))];
        setCategories(cats);
      }
      setIsLoading(false);
    };
    fetchDeals();
  }, []);

  const filteredDeals = deals.filter((deal) => {
    const matchesCategory = activeCategory === "all" || deal.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || (deal.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isEndingSoon = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl tracking-wide text-foreground">DEALS</h1>
              <p className="text-sm text-muted-foreground">Exclusive offers for you</p>
            </div>
            <Button variant="secondary" size="icon"><Filter className="w-5 h-5" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search deals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary border-border" />
          </div>
        </div>
        {categories.length > 0 && (
          <div className="px-5 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
            <Button key="all" variant={activeCategory === "all" ? "default" : "secondary"} size="sm" onClick={() => setActiveCategory("all")} className={activeCategory === "all" ? "btn-gold shrink-0" : "shrink-0"}>All</Button>
            {categories.map((cat) => (
              <Button key={cat} variant={activeCategory === cat ? "default" : "secondary"} size="sm" onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? "btn-gold shrink-0" : "shrink-0"}>{cat}</Button>
            ))}
          </div>
        )}
      </motion.header>

      <main className="px-5 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium rounded-xl p-4 animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-lg mb-4" />
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">No deals available</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon for exclusive member offers.</p>
            {activeCategory !== "all" && (
              <Button variant="ghost" onClick={() => { setActiveCategory("all"); setSearchQuery(""); }} className="mt-4 text-accent">View all</Button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{filteredDeals.length} {filteredDeals.length === 1 ? "deal" : "deals"} found</p>
            </div>
            <motion.div layout className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredDeals.map((deal, index) => (
                  <motion.div key={deal.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <DealCard
                      image={deal.image_url || dealImages[index % dealImages.length]}
                      title={deal.title}
                      description={deal.description || ""}
                      discount={deal.discount_value}
                      validUntil={format(new Date(deal.valid_until), "MMM dd")}
                      category={deal.category}
                      isMemberOnly={deal.is_member_only}
                      isEndingSoon={isEndingSoon(deal.valid_until)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default Deals;
