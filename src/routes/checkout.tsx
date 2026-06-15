import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/cart";
import { createOrder } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Akenga Boutique" },
      { name: "description", content: "Complete your order at Akenga Arts Centre." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw redirect({ to: "/register", search: { redirect: "/checkout" } as any });
    }
    return {};
  },
  component: Checkout,
});

const formSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  customerLocation: z.string().min(1, "Location is required"),
});

type FormValues = z.infer<typeof formSchema>;

function Checkout() {
  const { items, itemCount, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const total = items
        .reduce((sum, item) => {
          const num = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
          return sum + num * item.quantity;
        }, 0);

      await createOrder({
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone || "",
          customerLocation: data.customerLocation,
          total: `KES ${total.toLocaleString()}`,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      });
      clearCart();
      setCompleted(true);
      toast.success("Order placed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <section className="pt-36 pb-24 max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <div className="max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 mx-auto text-accent" />
          <h1 className="font-serif text-3xl md:text-5xl mt-6">Order Confirmed!</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Thank you for your order. We'll reach out to you at your email with the next steps.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex px-8 py-3 border border-accent text-accent text-xs tracking-[0.25em] uppercase hover:bg-accent hover:text-accent-foreground transition"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="pt-36 pb-24 max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="font-serif text-3xl md:text-5xl mt-6">Cart is Empty</h1>
          <p className="mt-4 text-muted-foreground">
            Add some items before checking out.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex px-8 py-3 border border-accent text-accent text-xs tracking-[0.25em] uppercase hover:bg-accent hover:text-accent-foreground transition"
          >
            Browse Shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pt-36 pb-8 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="eyebrow">Complete</p>
        <h1 className="font-serif text-5xl md:text-7xl mt-4">Checkout</h1>
      </section>

      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                  <div className="min-w-0 mr-2">
                    <span className="font-medium break-words">{item.productName}</span>
                    <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0">{item.price}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your order
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl mb-6">Your Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name</Label>
                <Input id="customerName" {...register("customerName")} placeholder="Your full name" />
                {errors.customerName && <p className="text-xs text-destructive mt-1">{errors.customerName.message}</p>}
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input id="customerEmail" type="email" {...register("customerEmail")} placeholder="you@example.com" />
                {errors.customerEmail && <p className="text-xs text-destructive mt-1">{errors.customerEmail.message}</p>}
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone (optional)</Label>
                <Input id="customerPhone" {...register("customerPhone")} placeholder="+254..." />
              </div>
              <div>
                <Label htmlFor="customerLocation">Location / Address</Label>
                <Input id="customerLocation" {...register("customerLocation")} placeholder="e.g. Kilimani, Nairobi" />
                {errors.customerLocation && <p className="text-xs text-destructive mt-1">{errors.customerLocation.message}</p>}
              </div>
              <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Place Order
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
