import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Akenga Boutique" },
      { name: "description", content: "Your shopping cart at Akenga Arts Centre." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { items, removeItem, updateQuantity, itemCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section className="pt-36 pb-24 max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40" />
          <h1 className="font-serif text-3xl md:text-5xl mt-6">Your Cart is Empty</h1>
          <p className="mt-4 text-muted-foreground">
            Browse our boutique and add pieces to your collection.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3 border border-accent text-accent text-xs tracking-[0.25em] uppercase hover:bg-accent hover:text-accent-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pt-36 pb-8 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="eyebrow">Review</p>
        <h1 className="font-serif text-5xl md:text-7xl mt-4">Cart</h1>
      </section>

      <section className="max-w-5xl mx-auto px-6 lg:px-10 py-8">
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-6 p-4 border border-border rounded-lg"
            >
              {item.image && (
                <div className="w-24 h-24 shrink-0 overflow-hidden bg-muted rounded-md">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg md:text-xl truncate">{item.productName}</h3>
                <p className="text-sm text-accent mt-1">{item.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1.5 border border-border rounded hover:bg-muted transition-colors cursor-pointer"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1.5 border border-border rounded hover:bg-muted transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              to="/shop"
              className="flex-1 text-center px-6 py-3 border border-border text-xs tracking-[0.25em] uppercase text-foreground/70 hover:border-accent hover:text-accent transition cursor-pointer"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="flex-1 px-6 py-3 bg-accent text-accent-foreground text-xs tracking-[0.25em] uppercase hover:bg-accent/90 transition cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
