import { motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";

interface TierProgressProps {
  currentTier: "silver" | "gold" | "platinum";
  currentPoints: number;
  nextTierPoints?: number;
  nextTier?: "gold" | "platinum";
}

const tierConfig = {
  silver: {
    label: "Silver",
    icon: Sparkles,
    color: "from-gray-400 to-gray-300",
    multiplier: "1x",
  },
  gold: {
    label: "Gold",
    icon: Crown,
    color: "from-amber-500 to-amber-400",
    multiplier: "1.5x",
  },
  platinum: {
    label: "Platinum",
    icon: Crown,
    color: "from-gray-700 to-gray-900",
    multiplier: "2x",
  },
};

export const TierProgress = ({
  currentTier,
  currentPoints,
  nextTierPoints,
  nextTier,
}: TierProgressProps) => {
  const currentConfig = tierConfig[currentTier];
  const nextConfig = nextTier ? tierConfig[nextTier] : null;
  const CurrentIcon = currentConfig.icon;
  const progress = nextTierPoints ? (currentPoints / nextTierPoints) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentConfig.color} flex items-center justify-center`}>
            <CurrentIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-display text-xl tracking-wide text-foreground">
              {currentConfig.label} Member
            </p>
            <p className="text-sm text-muted-foreground">
              {currentConfig.multiplier} points multiplier
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display tracking-wide text-gradient-gold">
            {currentPoints.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">lifetime points</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && nextTierPoints && (
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Progress to {nextConfig?.label}
            </span>
            <span className="text-foreground font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${nextConfig?.color}`}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {(nextTierPoints - currentPoints).toLocaleString()} more points to {nextConfig?.label}
          </p>
        </div>
      )}

      {/* Tier benefits preview */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Your Benefits
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Priority checkout",
            "Birthday bonus",
            "Exclusive deals",
            "Early access",
          ].map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-2 text-sm text-foreground/80"
            >
              <Star className="w-3 h-3 text-accent" />
              {benefit}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TierProgress;
