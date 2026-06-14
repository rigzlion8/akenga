import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — Akenga Arts Centre" },
      { name: "description", content: "Behind the gallery walls: live studios, resident artists, and current exhibitions at Akenga." },
      { property: "og:title", content: "Studio — Akenga Arts Centre" },
      { property: "og:description", content: "Living laboratories where technique meets vision." },
    ],
  }),
  component: Studio,
});

function Studio() {
  const live = [
    { name: "Amara Okafor", title: "Painting Atelier", desc: "Oil on canvas — an abstract landscape series taking shape across the season.", status: "Live", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781460963/q9cxxkpmmmzggui9yhjg.png" },
    { name: "Zuri Mwangi", title: "Ceramics Workshop", desc: "Wheel-thrown vessels marrying traditional silhouette with contemporary glaze.", status: "In Session", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781460977/haskvqaygihriydg6slq.png" },
  ];
  const shows = [
    { tag: "Collective Exhibition", title: "Echoes of the Savanna", desc: "A wide-ranging survey of contemporary sculpture exploring land, memory, and identity.", date: "June 1 – August 30, 2026", room: "Main Gallery", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781460985/lggaryxvsnrh5bhgmqhj.png" },
    { tag: "Kwame Asante", title: "Chromatic Resonance", desc: "Large-scale colour-field paintings questioning the emotional weight of pigment.", date: "July 15 – September 15, 2026", room: "East Wing", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781460992/cwjfj8n0xvv1okhxmrny.png" },
    { tag: "Nalini Sharma", title: "Threads of Ancestry", desc: "Mixed-media tapestries braiding heritage craft with digital processes.", date: "May 1 – July 30, 2026", room: "Textile Pavilion", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461000/xvy2gyqbhrzpesx6yh74.png" },
  ];
  return (
    <>
      <section className="pt-36 pb-16 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="eyebrow">The Atelier</p>
        <h1 className="font-serif text-7xl mt-4">Studio</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          Step behind the gallery walls. Our studios are living laboratories where technique meets vision — observe creation as it happens, and explore our curated exhibitions.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <p className="eyebrow flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> The Pulse — Studio Live</p>
        <h2 className="font-serif text-5xl mt-3">Inside the Studios</h2>
        <div className="h-px bg-accent/40 my-8" />
        <div className="grid md:grid-cols-2 gap-10">
          {live.map((l) => (
            <article key={l.title} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={l.img} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-4 right-4 bg-foreground/90 text-background text-[0.65rem] tracking-[0.25em] uppercase px-3 py-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />{l.status}
                </span>
                <button className="absolute bottom-4 left-4 bg-background/90 text-foreground text-xs tracking-[0.2em] uppercase px-4 py-2 hover:bg-accent hover:text-accent-foreground transition">View Live</button>
              </div>
              <p className="mt-5 eyebrow">{l.name}</p>
              <h3 className="font-serif text-3xl mt-2">{l.title}</h3>
              <p className="text-muted-foreground mt-2">{l.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <p className="eyebrow">Current & Upcoming</p>
        <h2 className="font-serif text-5xl mt-3">Art Exhibitions</h2>
        <div className="h-px bg-accent/40 my-8" />
        <div className="grid md:grid-cols-3 gap-8">
          {shows.map((s) => (
            <article key={s.title} className="group">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="eyebrow mt-5">{s.tag}</p>
              <h3 className="font-serif text-2xl mt-2">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <p className="mt-4 text-xs text-foreground/70 tracking-wider">{s.date} · {s.room}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}