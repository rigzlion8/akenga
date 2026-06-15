import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getProducts } from "@/lib/api";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Akenga Boutique" },
      { name: "description", content: "A curated boutique of fine art, artisan craft, footwear, apparel and studio supplies from Akenga Arts Centre." },
      { property: "og:title", content: "Shop — Akenga Boutique" },
      { property: "og:description", content: "From handwoven raffia to gallery-quality originals." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [active, setActive] = useState("All");

  const { data: products } = useQuery({
    queryKey: ["products", "shop"],
    queryFn: () => getProducts(),
  });

  const categories = useMemo(() => {
    if (!products) return ["All"];
    const unique = [...new Set(products.map((p) => p.category))];
    return ["All", ...unique];
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (active === "All") return products;
    return products.filter((p) => p.category === active);
  }, [products, active]);

  return (
    <>
      <section className="pt-36 pb-16 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="eyebrow">The Boutique</p>
        <h1 className="font-serif text-5xl md:text-7xl mt-4">Shop</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          From handwoven raffia footwear to gallery-quality originals — every piece in our curated collection carries a story of craft, culture, and considered design.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12 text-center">
        <p className="eyebrow">The Curated Boutique</p>
        <h2 className="font-serif text-3xl md:text-5xl mt-3">Shop</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">A cabinet of curiosities — from artisanal craft to gallery-quality originals, each piece chosen with intention.</p>
        <div className="h-px w-40 bg-accent/50 mx-auto my-10" />

        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-3.5 py-2 sm:px-5 sm:py-2.5 text-[0.7rem] tracking-[0.2em] uppercase border transition ${active===c ? "bg-accent text-accent-foreground border-accent" : "border-border text-foreground/70 hover:border-accent hover:text-accent"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14 text-left">
          {filtered.map((p) => (
            <article key={p.id} className="group">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img src={p.images?.[0] ?? ""} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                {p.tag ? (
                  <span className="absolute top-4 left-4 bg-foreground/90 text-background text-[0.65rem] tracking-[0.2em] uppercase px-3 py-1.5">{p.tag}</span>
                ) : null}
              </div>
              <p className="eyebrow mt-5">{p.category}</p>
              <h3 className="font-serif text-xl md:text-2xl mt-2">{p.name}</h3>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-foreground/80">{p.price}</span>
                <button className="text-[0.7rem] tracking-[0.25em] uppercase text-accent hover:text-foreground">Add +</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
