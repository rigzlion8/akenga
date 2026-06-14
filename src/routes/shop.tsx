import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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

type Cat = "All" | "Fine Art" | "Footwear" | "Apparel" | "Supplies" | "Stationery" | "Decor" | "Naturalia";

const products: { name: string; cat: Exclude<Cat,"All">; tag: string; price: string; img: string }[] = [
  { name: "Handwoven Raffia Sandals", cat: "Footwear", tag: "Artisan Craft", price: "KES 4,500", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461009/i62zn4pgkgfa2yljogxw.png" },
  { name: "Abstract Landscape — Oil on Canvas", cat: "Fine Art", tag: "Original", price: "KES 85,000", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461023/pfu7phtdjksuqy15nmow.png" },
  { name: "Brushstroke Collection Tee", cat: "Apparel", tag: "Limited Edition", price: "KES 2,800", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461033/zrlmgg0ffm3fvvugvwez.png" },
  { name: "Botanical Art Postcard Set", cat: "Stationery", tag: "Best Seller", price: "KES 1,200", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461040/nixvd2jjypmr5ve7mdev.png" },
  { name: "Professional Oak Art Easel", cat: "Supplies", tag: "Studio Essential", price: "KES 18,500", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461046/a60u2bbxqqutpjif136w.png" },
  { name: "Artisan Honey Bee Hive", cat: "Naturalia", tag: "Spotlight", price: "KES 12,000", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461057/ywt3wsbhm2iq8zpnptv1.png" },
  { name: "Artist Brush Collection", cat: "Supplies", tag: "Professional", price: "KES 6,500", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461074/h6jjfzreuhgmurrxrfiq.png" },
  { name: "Geometric Ceramic Vase", cat: "Decor", tag: "Handmade", price: "KES 9,800", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461155/y8nkid2iv67qihxzbsm9.png" },
  { name: "Leather-Bound Sketchbook", cat: "Stationery", tag: "Essential", price: "KES 3,200", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461165/ah2olg2tipnhmaoq156v.png" },
  { name: "Woven Textile Art Panel", cat: "Fine Art", tag: "Heritage", price: "KES 42,000", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461178/siwmencqpor9f4y8jnmb.png" },
];

const cats: Cat[] = ["All","Fine Art","Footwear","Apparel","Supplies","Stationery","Decor","Naturalia"];

function Shop() {
  const [active, setActive] = useState<Cat>("All");
  const filtered = active === "All" ? products : products.filter(p => p.cat === active);
  return (
    <>
      <section className="pt-36 pb-16 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="eyebrow">The Boutique</p>
        <h1 className="font-serif text-7xl mt-4">Shop</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          From handwoven raffia footwear to gallery-quality originals — every piece in our curated collection carries a story of craft, culture, and considered design.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12 text-center">
        <p className="eyebrow">The Curated Boutique</p>
        <h2 className="font-serif text-5xl mt-3">Shop</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">A cabinet of curiosities — from artisanal craft to gallery-quality originals, each piece chosen with intention.</p>
        <div className="h-px w-40 bg-accent/50 mx-auto my-10" />

        <div className="flex flex-wrap gap-3 justify-center">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2.5 text-[0.7rem] tracking-[0.2em] uppercase border transition ${active===c ? "bg-accent text-accent-foreground border-accent" : "border-border text-foreground/70 hover:border-accent hover:text-accent"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14 text-left">
          {filtered.map((p) => (
            <article key={p.name} className="group">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-4 left-4 bg-foreground/90 text-background text-[0.65rem] tracking-[0.2em] uppercase px-3 py-1.5">{p.tag}</span>
              </div>
              <p className="eyebrow mt-5">{p.cat}</p>
              <h3 className="font-serif text-2xl mt-2">{p.name}</h3>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-foreground/80">{p.price}</span>
                <button className="text-[0.7rem] tracking-[0.25em] uppercase text-accent hover:text-foreground">Add +</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="eyebrow">The Naturalia Collection</p>
          <h2 className="font-serif text-5xl mt-3">Beyond the Canvas</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Our curated selection reaches past traditional supplies. The Artisan Bee Hive is a sculptural object — handcrafted from sustainably sourced timber, each hive honours the geometry of nature while supporting local apiaries.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Whether installed in the garden or kept as a working apiary, these pieces sit at the intersection of craft, ecology, and art that defines the Akenga ethos.
          </p>
          <button className="mt-8 px-8 py-3 border border-accent text-accent text-xs tracking-[0.25em] uppercase hover:bg-accent hover:text-accent-foreground transition">Explore Collection</button>
          <p className="mt-8 eyebrow">Starting from</p>
          <p className="font-serif text-3xl mt-1">KES 12,000</p>
        </div>
        <div className="aspect-[4/5] overflow-hidden bg-muted">
          <img src="https://res.cloudinary.com/dsjptulx6/image/upload/v1781461057/ywt3wsbhm2iq8zpnptv1.png" alt="Artisan Bee Hive" className="w-full h-full object-cover" />
        </div>
      </section>
    </>
  );
}