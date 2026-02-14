import { motion } from "framer-motion";
import { ShoppingBag, Gift, Star, TrendingUp } from "lucide-react";

interface PointsTransaction {
  id: string;
  type: "earned" | "redeemed" | "bonus" | "tier_bonus";
  description: string;
  points: number;
  date: string;
  storeName?: string;
}

interface PointsHistoryProps {
  transactions: PointsTransaction[];
}

const typeConfig = {
  earned: { icon: ShoppingBag, color: "text-green-400", prefix: "+" },
  redeemed: { icon: Gift, color: "text-accent", prefix: "-" },
  bonus: { icon: Star, color: "text-yellow-400", prefix: "+" },
  tier_bonus: { icon: TrendingUp, color: "text-accent", prefix: "+" },
};

export const PointsHistory = ({ transactions }: PointsHistoryProps) => {
  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => {
        const config = typeConfig[transaction.type];
        const Icon = config.icon;

        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-premium rounded-lg p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {transaction.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.storeName && `${transaction.storeName} • `}
                {transaction.date}
              </p>
            </div>
            <div className={`text-right font-display font-semibold ${config.color}`}>
              {config.prefix}{transaction.points.toLocaleString()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PointsHistory;
