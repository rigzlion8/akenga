import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Classes — Akenga Conservatory" },
      { name: "description", content: "Intimate, rigorous music instruction across classical and traditional instruments at the Akenga Conservatory." },
      { property: "og:title", content: "Classes — Akenga Conservatory" },
      { property: "og:description", content: "Master an instrument under accomplished mentors in Nairobi." },
    ],
  }),
  component: Classes,
});

function Classes() {
  const instruments = [
    { name: "Piano", style: "Classical & Contemporary", level: "All Levels", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461217/y7ggsqskn0aeyqq9wy8x.png" },
    { name: "Kora", style: "West African Tradition", level: "Beginner to Intermediate", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461235/aqhdoro9tjp46kapg3r3.png" },
    { name: "Violin", style: "Classical Strings", level: "All Levels", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461247/vu5og3b9hypxukmwadk0.png" },
    { name: "Drums", style: "African Percussion", level: "All Levels", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461253/qja11hhfqn2fdbyefhzl.png" },
  ];
  return (
    <>
      <section className="pt-36 pb-16 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="eyebrow">Music Education</p>
        <h1 className="font-serif text-7xl mt-4">Classes</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          The Akenga Conservatory offers intimate, rigorous instruction across classical and traditional instruments. Choose your path and begin your musical journey.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <p className="eyebrow">The Conservatory</p>
        <h2 className="font-serif text-5xl mt-3">Learn an Instrument</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Refine your craft under the guidance of accomplished musicians in our intimate, world-class conservatory.</p>
        <div className="h-px bg-accent/40 my-10" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {instruments.map((i) => (
            <article key={i.name} className="group">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img src={i.img} alt={i.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-serif text-3xl mt-5">{i.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{i.style}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[0.7rem] tracking-[0.2em] uppercase text-muted-foreground">{i.level}</span>
                <button className="text-[0.7rem] tracking-[0.25em] uppercase text-accent hover:text-foreground">Enroll →</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-foreground/85">
          “Music is the architecture of sound — and every student begins with a single note.”
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <p className="eyebrow">Admissions</p>
        <p className="mt-4 text-muted-foreground">A new term begins September 2026. Seats per class are limited.</p>
        <button className="mt-6 px-8 py-3 border border-accent text-accent text-xs tracking-[0.25em] uppercase hover:bg-accent hover:text-accent-foreground transition">Request a Prospectus</button>
      </section>
    </>
  );
}