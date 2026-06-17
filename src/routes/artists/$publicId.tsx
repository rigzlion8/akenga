import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Globe, Mail } from "lucide-react";
import { getArtistByPublicId, getArtworksByArtist } from "@/lib/api";

export const Route = createFileRoute("/artists/$publicId")({
  head: () => ({ meta: [{ title: "Artist — Akenga Arts Centre" }] }),
  component: ArtistProfile,
});

function ArtistProfile() {
  const { publicId } = useParams({ from: "/artists/$publicId" });

  const { data: artist, isLoading } = useQuery({
    queryKey: ["artist", publicId],
    queryFn: () => getArtistByPublicId({ data: { publicId } }),
    enabled: !!publicId,
  });

  const { data: artworks } = useQuery({
    queryKey: ["artworks", "artist", artist?.id],
    queryFn: () => getArtworksByArtist({ data: { artistId: artist!.id } }),
    enabled: !!artist?.id,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center pt-20"><p className="text-muted-foreground text-sm">Loading...</p></div>;
  if (!artist) return <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4"><p className="text-muted-foreground">Artist not found.</p><Link to="/artists" className="text-xs tracking-[0.2em] uppercase text-accent">Back to Artists</Link></div>;

  return (
    <>
      <section className="pt-36 pb-8 max-w-7xl mx-auto px-6 lg:px-10">
        <Link to="/artists" className="inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"><ArrowLeft className="h-3.5 w-3.5" />Artists</Link>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="w-40 h-40 mx-auto lg:mx-0 rounded-full overflow-hidden bg-muted border-2 border-border">
              {artist.profileImage ? <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-serif text-5xl text-muted-foreground">{(artist.name || "?")[0]}</div>}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl mt-6">{artist.name}</h1>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
              {artist.email && <a href={`mailto:${artist.email}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"><Mail className="h-3.5 w-3.5" />{artist.email}</a>}
              {artist.website && <a href={artist.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"><Globe className="h-3.5 w-3.5" />Website</a>}
            </div>
          </div>

          <div>
            {artist.bio && (
              <div className="mb-10">
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">About</h3>
                <p className="text-sm md:text-base leading-relaxed text-foreground/80 whitespace-pre-line">{artist.bio}</p>
              </div>
            )}

            <div>
              <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">Works ({artworks?.length || 0})</h3>
              {artworks && artworks.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {artworks.map((aw: any) => (
                    <Link key={aw.id} to="/artworks/$publicId" params={{ publicId: aw.publicId }} className="group block">
                      <div className="aspect-[4/3] overflow-hidden bg-muted rounded-xl border border-border">
                        <img src={aw.images?.[0] ?? ""} alt={aw.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <p className="font-serif text-base mt-3 group-hover:text-accent transition-colors">{aw.title}</p>
                      <div className="flex gap-2 mt-1">
                        {aw.medium && <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">{aw.medium}</span>}
                        {aw.year && <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">{aw.year}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground italic">No artworks yet.</p>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
