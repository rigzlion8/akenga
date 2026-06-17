import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"; import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
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

function PasswordInput({ id, label, placeholder, error, ...props }: any) {
  const [show, setShow] = useState(false);
  const { ref, ...rest } = props;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={show ? "text" : "password"} placeholder={placeholder} className="pr-10" {...rest} />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

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
            <PasswordInput id="password" label="New Password" placeholder="••••••" autoFocus {...register("password")} error={errors.password?.message} />
            <PasswordInput id="confirm" label="Confirm Password" placeholder="••••••" {...register("confirm")} error={errors.confirm?.message} />
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
