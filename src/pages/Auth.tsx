// src/pages/Auth.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Logo from "@/components/Logo";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validateSAIdNumber, hashIdNumber, signUpUserWithOTP } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

// -------------------- Validation Schemas --------------------
const emailSchema = z.string().email("Enter a valid email");
const passwordSchema = z.string().min(8, "Password must be 8+ chars");
const nameSchema = z.string().min(2).max(100);
const phoneSchema = z.string().regex(/^(\+27|0)\d{9}$/, "Enter valid SA phone number");
const idSchema = z.string().length(13).regex(/^\d{13}$/, "ID must be 13 digits");

type AuthMode = "login" | "signup" | "forgot" | "otp_verify";

// -------------------- Auth Component --------------------
const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const [otpCode, setOtpCode] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // -------------------- Redirect if logged in --------------------
  useEffect(() => {
    if (user && !isLoading) {
      navigate(searchParams.get("redirect") || "/");
    }
  }, [user, isLoading, navigate, searchParams]);

  // -------------------- OTP Countdown --------------------
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // -------------------- Form Validation --------------------
  const validateForm = (): boolean => {
    const newErrors: Record<string,string> = {};
    try { emailSchema.parse(email); } catch (e:any) { newErrors.email = e.errors[0].message; }
    if (mode!=="forgot") try { passwordSchema.parse(password); } catch (e:any) { newErrors.password = e.errors[0].message; }

    if (mode==="signup") {
      try { nameSchema.parse(fullName); } catch (e:any) { newErrors.fullName="Invalid name"; }
      try { phoneSchema.parse(phone); } catch (e:any) { newErrors.phone="Invalid phone"; }
      try { idSchema.parse(idNumber); } catch (e:any) { newErrors.idNumber="Invalid ID"; }

      if (!newErrors.idNumber && !validateSAIdNumber(idNumber)) newErrors.idNumber="Invalid SA ID";
      if (password!==confirmPassword) newErrors.confirmPassword="Passwords do not match";
    }

    if (mode==="otp_verify" && otpCode.length!==6) newErrors.otp="Enter 6-digit code";

    setErrors(newErrors);
    return Object.keys(newErrors).length===0;
  };

  // -------------------- Handlers --------------------
  const handleSignup = async () => {
    setIsSubmitting(true);
    try {
      await signUpUserWithOTP({ fullName, email, password, phone, idNumber });
      setPendingEmail(email);
      setOtpCountdown(60);
      setMode("otp_verify");
      toast({ title: "Check your email", description: "OTP sent to complete signup" });
    } catch (err:any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Signed in", description: "Welcome back!" });
    } catch (err:any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleForgotPassword = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      toast({ title: "Reset email sent", description: "Check your inbox" });
      setMode("login");
    } catch (err:any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleVerifyOTP = async () => {
    if (!pendingEmail) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: pendingEmail, token: otpCode, type: "signup" });
      if (error) throw error;
      toast({ title: "Verified!", description: "Signup complete" });
      setMode("login");
    } catch (err:any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleResendOTP = async () => {
    if (!pendingEmail || otpCountdown>0) return;
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: pendingEmail });
      if (error) throw error;
      setOtpCountdown(60);
      toast({ title: "Code resent", description: "Check your email" });
    } catch {
      toast({ title: "Error", description: "Could not resend OTP", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (mode==="signup") await handleSignup();
    else if (mode==="login") await handleLogin();
    else if (mode==="forgot") await handleForgotPassword();
    else if (mode==="otp_verify") await handleVerifyOTP();
  };

  // -------------------- Render --------------------
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background animate-pulse"><Logo size="xl"/></div>;

  if (mode==="otp_verify") return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-5 safe-top">
        <Button variant="ghost" size="sm" onClick={()=>setMode("signup")} className="gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </Button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-sm text-center">
          <Logo size="xl" className="mb-6"/>
          <h1 className="text-3xl font-display mb-2">Verify Your Email</h1>
          <p className="text-sm text-muted-foreground mb-8">{pendingEmail}</p>
          <InputOTP value={otpCode} onChange={setOtpCode} maxLength={6}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map(i=><InputOTPSlot key={i} index={i}/>)}
            </InputOTPGroup>
          </InputOTP>
          {errors.otp && <p className="text-xs text-destructive">{errors.otp}</p>}
          <Button className="w-full btn-gold my-4" onClick={handleVerifyOTP} disabled={isSubmitting || otpCode.length!==6}>
            {isSubmitting ? "Verifying..." : "Verify & Activate"}
          </Button>
          <button disabled={otpCountdown>0} onClick={handleResendOTP} className="text-sm text-accent hover:underline">
            {otpCountdown>0 ? `Resend in ${otpCountdown}s` : "Resend code"}
          </button>
        </motion.div>
      </main>
    </div>
  );

  // Login / Signup / Forgot Password Form
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-sm text-center">
          <Logo size="xl" className="mb-6"/>
          <h1 className="text-3xl font-display mb-2">{mode==="login"?"Welcome Back":mode==="signup"?"Join the Club":"Reset Password"}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode==="login"?"Sign in to access rewards":mode==="signup"?"Create account to earn points":"Enter email to reset password"}
          </p>
          <motion.form onSubmit={handleSubmit} className="space-y-4">
            {mode==="signup" && <>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" value={fullName} onChange={e=>setFullName(e.target.value)} disabled={isSubmitting}/>
              <Label htmlFor="idNumber">SA ID *</Label>
              <Input id="idNumber" value={idNumber} onChange={e=>setIdNumber(e.target.value.replace(/\D/g,""))} disabled={isSubmitting}/>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" value={phone} onChange={e=>setPhone(e.target.value)} disabled={isSubmitting}/>
            </>}
            <Label htmlFor="email">Email {mode==="signup"?"*":""}</Label>
            <Input id="email" value={email} onChange={e=>setEmail(e.target.value)} disabled={isSubmitting}/>
            {mode!=="forgot" && <>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} disabled={isSubmitting}/>
            </>}
            {mode==="signup" && <>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type={showPassword?"text":"password"} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} disabled={isSubmitting}/>
            </>}
            <Button type="submit" className="w-full btn-gold" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." :
                mode==="login"?"Sign In":mode==="signup"?"Create Account":"Send Reset Link"
              }
            </Button>
          </motion.form>
          <p className="text-sm mt-4">
            {mode==="login"?"Don't have an account?":"Already have an account?"}
            <button onClick={()=>setMode(mode==="login"?"signup":"login")} className="ml-2 text-accent hover:underline">
              {mode==="login"?"Sign Up":"Sign In"}
            </button>
          </p>
          {mode==="login" && <p className="text-sm mt-2">
            <button onClick={()=>setMode("forgot")} className="text-accent hover:underline">Forgot Password?</button>
          </p>}
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
