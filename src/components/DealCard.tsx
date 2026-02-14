import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, Percent } from "lucide-react";

interface DealCardProps {
  image: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  category: string;
  isMemberOnly?: boolean;
  isEndingSoon?: boolean;
  onClick?: () => void;
}

export const DealCard = ({
  image,
  title,
  description,
  discount,
  validUntil,
  category,
  isMemberOnly = false,
  isEndingSoon = false,
  onClick,
}: DealCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="card-premium rounded-xl overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-secondary/90 backdrop-blur-sm text-secondary-foreground">
            {category}
          </Badge>
          {isMemberOnly && (
            <Badge className="bg-accent/90 backdrop-blur-sm text-accent-foreground">
              Members Only
            </Badge>
          )}
        </div>

        {/* Discount Badge */}
        <div className="absolute top-3 right-3">
          <div className="gradient-gold rounded-lg px-3 py-1 flex items-center gap-1">
            <Percent className="w-3 h-3 text-primary-foreground" />
            <span className="font-bold text-primary-foreground text-sm">{discount}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">Valid until {validUntil}</span>
          </div>
          {isEndingSoon && (
            <span className="text-xs font-medium text-destructive">
              Ending Soon
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DealCard;
