import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, SunDim } from "lucide-react";
import Barcode from "react-barcode";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

const BarcodeScreen = () => {
  const navigate = useNavigate();
  const { profile, loyaltyAccount, isLoading } = useAuth();
  const [brightnessBoost, setBrightnessBoost] = useState(false);

  // Auto brightness boost effect
  useEffect(() => {
    if (brightnessBoost) {
      document.body.style.filter = "brightness(1.3)";
    } else {
      document.body.style.filter = "none";
    }

    return () => {
      document.body.style.filter = "none";
    };
  }, [brightnessBoost]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="animate-pulse">
          <Logo size="xl" />
        </div>
      </div>
    );
  }

  // Mock data for demo
  const displayData = {
    memberName: profile?.full_name || "Member",
    memberId: loyaltyAccount?.member_id || "BGM0000000000",
    barcode: loyaltyAccount?.barcode_value || "0000000000000",
    points: loyaltyAccount?.current_points || 0,
    tier: loyaltyAccount?.current_tier || "silver",
  };

  return (
    <div className={`min-h-screen flex flex-col ${brightnessBoost ? "bg-white" : "bg-charcoal"}`}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-5 safe-top"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className={brightnessBoost ? "text-charcoal" : "text-white"}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBrightnessBoost(!brightnessBoost)}
          className={brightnessBoost ? "text-charcoal" : "text-white"}
        >
          {brightnessBoost ? (
            <SunDim className="w-6 h-6" />
          ) : (
            <Sun className="w-6 h-6" />
          )}
        </Button>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center"
        >
          {/* Logo */}
          <div className="mb-8">
            <Logo size="lg" className="mx-auto" />
          </div>

          {/* Member Info */}
          <div className="mb-8">
            <p className={`text-xs uppercase tracking-[0.2em] ${brightnessBoost ? "text-charcoal/60" : "text-white/60"} mb-2`}>
              Member
            </p>
            <h1 className={`font-display text-2xl tracking-wide ${brightnessBoost ? "text-charcoal" : "text-white"}`}>
              {displayData.memberName}
            </h1>
          </div>

          {/* Points */}
          <div className="mb-8">
            <p className={`text-xs uppercase tracking-[0.2em] ${brightnessBoost ? "text-charcoal/60" : "text-white/60"} mb-2`}>
              Points Balance
            </p>
            <p className="text-4xl font-display tracking-wider text-gradient-gold">
              {displayData.points.toLocaleString()}
            </p>
          </div>

          {/* Barcode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-center mb-4">
              <Barcode
                value={displayData.barcode}
                width={2}
                height={80}
                background="transparent"
                lineColor="#141414"
                displayValue={false}
              />
            </div>
            <p className="text-center font-mono text-lg text-charcoal tracking-widest">
              {displayData.memberId}
            </p>
          </motion.div>

          {/* Scan Instructions */}
          <p className={`text-sm ${brightnessBoost ? "text-charcoal/60" : "text-white/60"} mt-6`}>
            Show this barcode at checkout to earn points
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-5 text-center safe-bottom">
        <p className={`text-xs ${brightnessBoost ? "text-charcoal/40" : "text-white/40"}`}>
          Tap the sun icon for brightness boost during scanning
        </p>
      </footer>
    </div>
  );
};

export default BarcodeScreen;
