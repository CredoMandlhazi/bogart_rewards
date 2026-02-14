import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink } from "lucide-react";

interface PromoCardProps {
  image: string;
  title: string;
  subtitle?: string;
  discount?: string;
  badge?: string;
  isLarge?: boolean;
  href?: string;
  onClick?: () => void;
}

const BOGART_SITE = "https://www.bogartman.com/";

export const PromoCard = ({
  image,
  title,
  subtitle,
  discount,
  badge,
  isLarge = false,
  href,
  onClick,
}: PromoCardProps) => {
  const handleClick = () => {
    if (onClick) return onClick();
    const url = href || BOGART_SITE;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`promo-card cursor-pointer group ${isLarge ? "aspect-[4/5]" : "aspect-square"}`}
      onClick={handleClick}
    >
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {badge && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-accent text-accent-foreground font-semibold px-3 py-1 uppercase text-[10px] tracking-wider">{badge}</Badge>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {discount && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-accent font-display text-3xl font-bold mb-2">{discount}</motion.p>
        )}
        <h3 className="font-display text-xl font-semibold text-foreground mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <div className="flex items-center gap-2 mt-3 text-foreground/80 group-hover:text-accent transition-colors">
          <span className="text-xs uppercase tracking-wider font-medium">View Offer</span>
          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
};

export default PromoCard;
