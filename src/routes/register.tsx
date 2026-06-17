import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff, Loader2, Palette, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerUser } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — Akenga Arts Centre" }] }),
  component: Register,
});

function Register() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [role, setRole] = useState<"user" | "artist">("user");
  const [loginUrl, setLoginUrl] = useState("/login");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    setLoginUrl(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login");
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await registerUser({ data: { ...data, role } });
      setRegistered(true);
      toast.success("Account created! Check your email to activate.");
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    } finally { setSubmitting(false); }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-24 pb-12">
        <div className="max-w-sm text-center">
          <span className="inline-flex w-14 h-14 rounded-full border-2 border-accent items-center justify-center font-serif text-accent text-2xl">A</span>
          <h1 className="font-serif text-2xl mt-4">Check Your Email</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">We've sent an activation link to your email. Click the link to activate your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-24 pb-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex w-14 h-14 rounded-full border-2 border-accent items-center justify-center font-serif text-accent text-2xl">A</span>
          <h1 className="font-serif text-2xl mt-4">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-2">Join the Akenga Arts Centre community</p>
        </div>

        {/* User type selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors cursor-pointer ${role === "user" ? "border-accent bg-accent/5 text-accent" : "border-border hover:border-accent/50 text-muted-foreground"}`}
          >
            <User className="h-4 w-4" />
            <span className="text-xs tracking-[0.15em] uppercase font-medium">User</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("artist")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors cursor-pointer ${role === "artist" ? "border-accent bg-accent/5 text-accent" : "border-border hover:border-accent/50 text-muted-foreground"}`}
          >
            <Palette className="h-4 w-4" />
            <span className="text-xs tracking-[0.15em] uppercase font-medium">Artist</span>
          </button>
        </div>
        <p className="text-[0.65rem] text-muted-foreground text-center -mt-4 mb-4">
          {role === "artist" ? "Artists can manage their portfolio and exhibitions." : "Browse, shop, and enroll in classes."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name")} placeholder="Your full name" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} placeholder="••••••••" className="pr-10" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" tabIndex={-1}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            {submitting ? "Creating Account..." : `Create ${role === "artist" ? "Artist" : ""} Account`}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <a href={loginUrl} className="text-accent hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
