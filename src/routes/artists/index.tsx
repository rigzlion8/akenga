import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getArtists, getDailyArtworks } from "@/lib/api";

export const Route = createFileRoute("/artists/")({
  head: () => ({
    meta: [
      { title: "Artists — Akenga Arts Centre" },
      { name: "description", content: "Discover the artists behind the work at Akenga Arts Centre." },
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
        <h1 className="font-serif text-5xl md:text-7xl mt-4">Artists</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          Meet the creative voices behind Akenga — a rotating collective of painters, sculptors, digital artists, and artisans shaping contemporary African art.
        </p>
      </section>

      {/* Daily rotating artworks section */}
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
            <Link key={a.id} to="/artists/$publicId" params={{ publicId: a.publicId }} className="group block text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-muted border-2 border-border group-hover:border-accent transition-colors">
                {a.profileImage ? (
                  <img src={a.profileImage} alt={a.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-muted-foreground">
                    {(a.name || "?")[0]}
                  </div>
                )}
              </div>
              <h3 className="font-serif text-xl mt-4 group-hover:text-accent transition-colors">{a.name}</h3>
              {a.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{a.bio}</p>}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
