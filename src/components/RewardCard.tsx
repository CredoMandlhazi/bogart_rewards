import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Lock } from "lucide-react";

interface RewardCardProps {
  title: string;
  description: string;
  pointsCost: number;
  currentPoints: number;
  image?: string;
  category?: string;
  onRedeem?: () => void;
}

export const RewardCard = ({
  title,
  description,
  pointsCost,
  currentPoints,
  image,
  category,
  onRedeem,
}: RewardCardProps) => {
  const canRedeem = currentPoints >= pointsCost;
  const progress = Math.min((currentPoints / pointsCost) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-premium rounded-xl overflow-hidden"
    >
      {/* Image Section */}
      {image ? (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          {category && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-secondary/80 backdrop-blur-sm rounded-md text-[10px] uppercase tracking-wider font-medium text-secondary-foreground">
              {category}
            </span>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-secondary flex items-center justify-center">
          <Gift className="w-12 h-12 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {currentPoints.toLocaleString()} / {pointsCost.toLocaleString()} pts
            </span>
            <span className={canRedeem ? "text-accent font-medium" : "text-muted-foreground"}>
              {canRedeem ? "Available" : `${pointsCost - currentPoints} more`}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${canRedeem ? "gradient-gold" : "bg-muted-foreground/50"}`}
            />
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onRedeem}
          disabled={!canRedeem}
          className={`w-full ${canRedeem ? "btn-gold" : ""}`}
          variant={canRedeem ? "default" : "secondary"}
        >
          {canRedeem ? (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Redeem Now
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Earn More Points
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default RewardCard;
