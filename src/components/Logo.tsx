import bogartLogo from "@/assets/bogart-logo-2.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  showTitle?: boolean;
}

const sizeClasses = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
  xl: "h-14",
};

export const Logo = ({ className, size = "md", showTagline = false, showTitle = false }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={bogartLogo}
        alt="Bogart Man"
        className={cn("object-contain", sizeClasses[size])}
      />
      {showTitle && (
        <span className="font-display text-sm tracking-wider text-foreground whitespace-nowrap">
          Bogartman Rewards
        </span>
      )}
      {showTagline && (
        <p className="text-[10px] text-muted-foreground tracking-wider mt-1">
          Premium Men's Fashion
        </p>
      )}
    </div>
  );
};

export default Logo;
