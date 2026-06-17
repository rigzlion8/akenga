import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"; import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { resetPassword } from "@/lib/api";

const schema = z.object({
  password: z.string().min(6, "At least 6 characters"),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });
type F = z.infer<typeof schema>;

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — Akenga Arts Centre" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ token: (s.token as string) || "" }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = useSearch({ from: "/reset-password" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setSubmitting(true); setError("");
    try { await resetPassword({ data: { token, password: data.password } }); setDone(true); }
    catch (e: any) { setError(e.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6">
      <div className="text-center max-w-md"><p className="text-muted-foreground">Invalid or missing reset link.</p><Link to="/forgot-password" className="text-xs text-accent mt-4 inline-block">Request a new link</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-accent mb-4">
            <span className="font-serif text-xl text-accent">A</span>
          </div>
          <h1 className="font-serif text-3xl">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {done ? "Your password has been updated." : "Choose a new password for your account."}
          </p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">{error}</div>}
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" {...register("password")} placeholder="••••••" autoFocus />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" {...register("confirm")} placeholder="••••••" />
              {errors.confirm && <p className="text-xs text-destructive mt-1">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
              Update Password
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <Link to="/login" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">Sign in with your new password</Link>
          </div>
        )}
      </div>
    </div>
  );
}
