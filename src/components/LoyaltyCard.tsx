import { motion } from "framer-motion";
import Barcode from "react-barcode";
import { Crown, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

interface LoyaltyCardProps {
  memberName: string;
  memberId: string;
  points: number;
  tier: "silver" | "gold" | "platinum";
}

const tierConfig = {
  silver: {
    label: "Silver",
    className: "tier-silver",
    icon: Sparkles,
  },
  gold: {
    label: "Gold",
    className: "tier-gold",
    icon: Crown,
  },
  platinum: {
    label: "Platinum",
    className: "tier-platinum",
    icon: Crown,
  },
};

export const LoyaltyCard = ({
  memberName,
  memberId,
  points,
  tier,
}: LoyaltyCardProps) => {
  const tierInfo = tierConfig[tier];
  const TierIcon = tierInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="loyalty-card"
    >
      {/* Card Header */}
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div>
          <Logo size="md" className="mb-1 invert" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-1">
            Premium Men's Fashion
          </p>
        </div>
        <div className={`tier-badge ${tierInfo.className}`}>
          <TierIcon className="w-3 h-3" />
          {tierInfo.label}
        </div>
      </div>

      {/* Member Info */}
      <div className="relative z-10 mb-6">
        <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">
          Member
        </p>
        <p className="font-display text-xl text-white tracking-wide">
          {memberName}
        </p>
      </div>

      {/* Points Display */}
      <div className="relative z-10 mb-6">
        <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">
          Points Balance
        </p>
        <p className="points-display">{points.toLocaleString()}</p>
      </div>

      {/* Barcode Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="relative z-10 bg-white rounded-lg p-3 mt-4"
      >
        <div className="flex items-center justify-center">
          <Barcode
            value={memberId}
            width={1.5}
            height={50}
            background="transparent"
            lineColor="#141414"
            displayValue={false}
          />
        </div>
        <p className="text-center text-xs font-mono text-primary mt-2 tracking-widest">
          {memberId}
        </p>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full" />
    </motion.div>
  );
};

export default LoyaltyCard;
