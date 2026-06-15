import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Akenga Arts Centre — Where Art Breathes, Roots | Love | Culture" },
      { name: "description", content: "A Nairobi-based arts centre at the intersection of heritage and innovation: gallery, conservatory, and curated boutique." },
      { property: "og:title", content: "Akenga Arts Centre" },
      { property: "og:description", content: "Where Art Breathes, Roots | Love | Culture" },
    ],
  }),
  component: Index,
});

function Index() {
  const partners = [
    "National Museum of Kenya", "Smithsonian Africa", "Tate Modern", "The MET",
    "WikiArt", "Centre Pompidou", "Zeitz MOCAA", "Serpentine Gallery",
    "Venice Biennale", "Art Basel",
  ];
  const pubs = [
    { tag: "Market", date: "March 2026", title: "The Rise of Artisanal Commerce in East Africa", excerpt: "How curated craft economies are reshaping the bond between maker and collector.", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781460985/lggaryxvsnrh5bhgmqhj.png" },
    { tag: "Exhibition", date: "April 2026", title: "Echoes of the Savanna — Opening Notes", excerpt: "Inside a sweeping group survey of contemporary sculpture grounded in land and memory.", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781460992/cwjfj8n0xvv1okhxmrny.png" },
    { tag: "Studio", date: "February 2026", title: "On Pigment, Patience and Practice", excerpt: "An afternoon in the painting atelier with resident artist Amara Okafor.", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461000/xvy2gyqbhrzpesx6yh74.png" },
  ];
  const rooms = [
    { n: "01", title: "The Studio", sub: "Witness creation in real time", to: "/studio" as const },
    { n: "02", title: "The Conservatory", sub: "Master an instrument", to: "/classes" as const },
    { n: "03", title: "The Boutique", sub: "Curated art & artefacts", to: "/shop" as const },
  ];
  return (
    <>
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src="https://res.cloudinary.com/dsjptulx6/image/upload/v1781461205/r2xhlg762xg2rgps3dbx.png"
          alt="Akenga Arts Centre studio interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-background" />
        <div className="relative text-center px-6">
          <p className="eyebrow text-accent">Est. 2024 · Nairobi, Kenya</p>
          <h1 className="mt-6 font-serif text-5xl sm:text-7xl md:text-9xl tracking-[0.15em] text-background drop-shadow-lg">AKENGA</h1>
          <p className="mt-6 font-serif italic text-sm sm:text-lg md:text-2xl text-background/90 whitespace-nowrap">Where Art Breathes, Roots | Love | Culture</p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
          <p className="eyebrow text-background/70">Explore</p>
          <div className="mt-2 w-px h-10 bg-background/50 mx-auto" />
        </div>
      </section>

      {/* QUOTE */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-foreground/85">
          “Akenga sits at the meeting place of heritage and invention — a living archive where African creativity is exhibited, taught, and celebrated.”
        </p>
      </section>

      {/* PUBLICATIONS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
          <div>
            <p className="eyebrow">The Akenga Journal</p>
            <h2 className="font-serif text-5xl mt-2">Publications</h2>
          </div>
          <button className="text-xs tracking-[0.25em] uppercase text-accent hover:text-foreground transition">View Archive →</button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {pubs.map((p) => (
            <article key={p.title} className="group cursor-pointer">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs tracking-[0.2em] uppercase">
                <span className="text-accent">{p.tag}</span>
                <span className="text-muted-foreground">{p.date}</span>
              </div>
              <h3 className="font-serif text-2xl mt-3 group-hover:text-accent transition">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.excerpt}</p>
              <p className="mt-4 text-xs tracking-[0.2em] uppercase text-foreground/70">Read More →</p>
            </article>
          ))}
        </div>
      </section>

      {/* ROOMS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 grid md:grid-cols-3 gap-px bg-border">
        {rooms.map((r) => (
          <Link key={r.n} to={r.to} className="bg-background p-12 group hover:bg-card transition-colors min-h-[280px] flex flex-col justify-between">
            <span className="font-serif text-accent text-xl">{r.n}</span>
            <div>
              <h3 className="font-serif text-4xl">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.sub}</p>
              <p className="mt-8 text-xs tracking-[0.25em] uppercase text-accent group-hover:translate-x-2 transition-transform">Enter →</p>
            </div>
          </Link>
        ))}
      </section>

      {/* PARTNERS MARQUEE */}
      <section className="py-20 border-t border-border overflow-hidden">
        <p className="eyebrow text-center mb-10">Institutional Partners & Collaborations</p>
        <div
          className="flex gap-16 whitespace-nowrap hover:[animation-play-state:paused]"
          style={{
            animation: "marquee 40s linear infinite",
            width: "max-content",
          }}
        >
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="font-serif text-2xl text-muted-foreground/80">{p}</span>
          ))}
        </div>
      </section>

      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </>
  );
}
