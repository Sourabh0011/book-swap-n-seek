import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const clearLocalAuthSession = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // ignore local cleanup errors
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "Confirmation link sent!" });
      } else {
        await clearLocalAuthSession();

        let lastError: Error | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error) {
            navigate("/dashboard");
            return;
          }

          lastError = error;
          const isFetchError = /failed to fetch/i.test(error.message ?? "");
          if (!isFetchError || attempt === 1) break;

          await clearLocalAuthSession();
        }

        if (lastError) throw lastError;
      }
    } catch (error: any) {
      const isFetchError = /failed to fetch/i.test(error?.message ?? "");
      toast({
        title: "Error",
        description: isFetchError
          ? "Network/auth session issue. Please refresh once and try again."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] w-full overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4"
            >
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isSignUp ? "Join the community of book lovers" : "Sign in to manage your bazaar"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="bookworm_42"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={isSignUp}
                      className="rounded-xl pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full rounded-xl h-12 text-base font-bold transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {isSignUp ? "Sign Up" : "Sign In"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account yet?"}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-2 text-primary font-bold hover:underline underline-offset-4 flex items-center justify-center mx-auto gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isSignUp ? "Switch to Login" : "Create a new account"}
            </button>
          </div>
        </div>

        {/* Info Badge */}
        <p className="mt-6 text-center text-xs text-muted-foreground px-8">
          By continuing, you agree to BookBazzar's Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;