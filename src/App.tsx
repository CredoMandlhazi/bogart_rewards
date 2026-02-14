import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Deals from "./pages/Deals";
import Rewards from "./pages/Rewards";
import Stores from "./pages/Stores";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import BarcodeScreen from "./pages/BarcodeScreen";
import PurchaseHistory from "./pages/PurchaseHistory";
import PersonalInfo from "./pages/PersonalInfo";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const hideNav = ["/auth", "/barcode"].includes(location.pathname);

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/deals" element={<ProtectedRoute><Deals /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        <Route path="/stores" element={<ProtectedRoute><Stores /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/barcode" element={<ProtectedRoute><BarcodeScreen /></ProtectedRoute>} />
        <Route path="/purchases" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
        <Route path="/profile/info" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
        <Route path="/profile/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
