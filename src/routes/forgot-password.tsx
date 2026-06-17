import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"; import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { forgotPassword } from "@/lib/api";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type F = z.infer<typeof schema>;

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Akenga Arts Centre" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setSubmitting(true);
    try { await forgotPassword({ data }); setSent(true); } catch { /* silently handle */ }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-accent mb-4">
            <span className="font-serif text-xl text-accent">A</span>
          </div>
          <h1 className="font-serif text-3xl">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sent ? "If an account with that email exists, you'll receive a reset link shortly." : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="you@example.com" autoFocus />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Reset Link
            </Button>
            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors">
                <ArrowLeft className="h-3 w-3" />Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-2">
              <Mail className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm text-muted-foreground">Check your inbox (and spam folder). The link expires in 1 hour.</p>
            <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors">
              <ArrowLeft className="h-3 w-3" />Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
