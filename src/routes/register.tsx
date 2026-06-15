import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";
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
  head: () => ({ meta: [{ title: "Register — Akenga Boutique" }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    return redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login";
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const result = await registerUser({ data });
      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("auth_user", JSON.stringify(result.user));
      toast.success("Account created successfully");

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      navigate({ to: redirect || "/shop" } as any);
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-24 pb-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex w-14 h-14 rounded-full border-2 border-accent items-center justify-center font-serif text-accent text-2xl">A</span>
          <h1 className="font-serif text-2xl mt-4">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-2">Register to shop at Akenga Arts Centre</p>
        </div>

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
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            {submitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <a href={loginUrl} className="text-accent hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
