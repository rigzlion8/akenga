import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { getArtists, getDailyArtworks } from "@/lib/api";

export const Route = createFileRoute("/artists/")({
  head: () => ({
    meta: [
      { title: "Artist Profiles — Akenga Arts Centre | Contemporary African Artists" },
      { name: "description", content: "Discover the artists behind the work at Akenga Arts Centre — a collective of painters, sculptors, digital artists and artisans." },
    ],
  }),
  component: ArtistsIndex,
});

function ArtistsIndex() {
  const { data: artists } = useQuery({ queryKey: ["artists"], queryFn: () => getArtists() });
  const { data: daily } = useQuery({ queryKey: ["dailyArtworks"], queryFn: () => getDailyArtworks() });

  return (
    <>
      <section className="pt-36 pb-16 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="eyebrow">The Collective</p>
        <h1 className="font-serif text-4xl md:text-7xl mt-4">Artist Profiles</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          Meet the creative voices behind Akenga — a rotating collective of painters, sculptors, digital artists, and artisans shaping contemporary African art.
        </p>
      </section>

      {/* Daily rotating artworks */}
      {daily && daily.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="eyebrow">Today's Selection</p>
              <h2 className="font-serif text-2xl md:text-3xl mt-2">Featured Works</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {daily.map((aw: any) => (
              <Link key={aw.id} to="/artworks/$publicId" params={{ publicId: aw.publicId }} className="group block">
                <div className="aspect-square overflow-hidden bg-muted rounded-xl border border-border">
                  <img src={aw.images?.[0] ?? ""} alt={aw.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-3">{aw.medium || "Artwork"}</p>
                <h3 className="font-serif text-lg mt-1 group-hover:text-accent transition-colors line-clamp-1">{aw.title}</h3>
                {aw.year && <p className="text-xs text-muted-foreground mt-0.5">{aw.year}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Artists grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="h-px w-40 bg-accent/50 mx-auto mb-12" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(artists || []).map((a: any) => (
            <div key={a.id} className="group">
              <Link
                to="/artists/$publicId"
                params={{ publicId: a.publicId }}
                className="block"
              >
                {/* Portrait card */}
                <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-muted rounded-xl border border-border">
                  {a.profileImage ? (
                    <img
                      src={a.profileImage}
                      alt={a.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <span className="font-serif text-6xl">{(a.name || "?")[0]}</span>
                      <span className="text-xs tracking-[0.2em] uppercase">No image</span>
                    </div>
                  )}

                  {/* Gradient overlay at bottom for text readability */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                  {/* Name overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-serif text-2xl md:text-3xl text-white">{a.name}</h3>
                    {a.bio && (
                      <p className="text-white/70 text-xs mt-1.5 line-clamp-2">{a.bio}</p>
                    )}
                  </div>
                </div>
              </Link>

              {/* View Profile button */}
              <Link
                to="/artists/$publicId"
                params={{ publicId: a.publicId }}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-xs tracking-[0.2em] uppercase text-foreground/80 hover:border-accent hover:text-accent transition-colors"
              >
                View Profile
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
