import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, HelpCircle, MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  { q: "How do I earn points?", a: "You earn points on every purchase at any Bogart Man store. Simply scan your loyalty barcode at checkout." },
  { q: "How do tiers work?", a: "There are three tiers: Silver, Gold, and Platinum. As you accumulate lifetime points, you progress to higher tiers with better multipliers and exclusive rewards." },
  { q: "How do I redeem rewards?", a: "Go to the Rewards tab, browse available rewards, and tap 'Redeem Now' if you have enough points. You'll receive a redemption code to use in-store." },
  { q: "Can I transfer points?", a: "Points are non-transferable and linked to your loyalty account." },
  { q: "What happens if I lose my phone?", a: "Your loyalty data is securely stored in the cloud. Simply log in on a new device to access your account." },
  { q: "How do I update my details?", a: "Go to Profile > Personal Information to update your name and phone number." },
];

const HelpSupport = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Error", description: "Please fill in both subject and message.", variant: "destructive" });
      return;
    }
    setIsSending(true);
    // For now, just show confirmation - ticket system can be extended
    setTimeout(() => {
      toast({ title: "Ticket submitted", description: "We'll get back to you within 24-48 hours." });
      setSubject("");
      setMessage("");
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="flex items-center gap-3 px-5 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-foreground">HELP & SUPPORT</h1>
            <p className="text-sm text-muted-foreground">FAQs and contact us</p>
          </div>
        </div>
      </motion.header>

      <main className="px-5 py-6 space-y-8">
        {/* FAQs */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-xl tracking-wide text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="card-premium rounded-xl overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground pl-7">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact Form */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-display text-xl tracking-wide text-foreground mb-4">
            <MessageCircle className="w-5 h-5 inline mr-2 text-accent" />
            Contact Support
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What do you need help with?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..." rows={4} />
            </div>
            <Button onClick={handleSubmitTicket} disabled={isSending} className="w-full btn-gold">
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Submit Ticket"}
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default HelpSupport;
