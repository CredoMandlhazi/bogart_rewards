import { motion } from "framer-motion";
import { Home, Tag, Gift, User, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Tag, label: "Deals", path: "/deals" },
  { icon: Gift, label: "Rewards", path: "/rewards" },
  { icon: MapPin, label: "Stores", path: "/stores" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path} className="flex-1">
              <motion.div
                className={`nav-item ${isActive ? "active" : ""}`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  initial={false}
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-accent" : ""}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
