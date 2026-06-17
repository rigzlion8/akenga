import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Globe, Mail } from "lucide-react";
import { getArtistByPublicId, getArtworksByArtist } from "@/lib/api";

export const Route = createFileRoute("/artists/$publicId")({
  head: () => ({ meta: [{ title: "Artist — Akenga Arts Centre" }] }),
  component: ArtistProfile,
});

function ArtistProfile() {
  const { publicId } = useParams({ from: "/artists/$publicId" });
  const [activeSlide, setActiveSlide] = useState(0);

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

  const works = artworks || [];
  const hasCarousel = works.length > 0;
  const slideCount = Math.min(works.length, 6);

  const prevSlide = () => setActiveSlide((i) => (i - 1 + slideCount) % slideCount);
  const nextSlide = () => setActiveSlide((i) => (i + 1) % slideCount);

  return (
    <>
      {/* Breadcrumb */}
      <section className="pt-36 pb-8 max-w-7xl mx-auto px-6 lg:px-10">
        <Link to="/artists" className="inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />Artists
        </Link>
      </section>

      {/* Hero: portrait + info */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Portrait */}
          <div className="relative">
            <div className="aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border">
              {artist.profileImage ? (
                <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <span className="font-serif text-7xl">{(artist.name || "?")[0]}</span>
                  <span className="text-xs tracking-[0.2em] uppercase">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="eyebrow">Artist Profile</p>
            <h1 className="font-serif text-4xl md:text-6xl mt-3">{artist.name}</h1>

            <div className="flex flex-wrap gap-4 mt-6">
              {artist.email && (
                <a href={`mailto:${artist.email}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                  <Mail className="h-3.5 w-3.5" />{artist.email}
                </a>
              )}
              {artist.website && (
                <a href={artist.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                  <Globe className="h-3.5 w-3.5" />Website
                </a>
              )}
            </div>

            <div className="h-px w-24 bg-accent/50 my-8" />

            {artist.bio ? (
              <div>
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">About</h3>
                <p className="text-sm md:text-base leading-relaxed text-foreground/80 whitespace-pre-line">{artist.bio}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No biography yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Artworks carousel */}
      {hasCarousel && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <div className="border-t border-border/60 pt-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="eyebrow">Portfolio</p>
                <h2 className="font-serif text-2xl md:text-3xl mt-2">Featured Works</h2>
              </div>
              {slideCount > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={prevSlide} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors cursor-pointer">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={nextSlide} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors cursor-pointer">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Carousel container */}
            <div className="relative overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {works.slice(0, 6).map((aw: any, i: number) => (
                  <Link
                    key={aw.id}
                    to="/artworks/$publicId"
                    params={{ publicId: aw.publicId }}
                    className="w-full shrink-0 group"
                  >
                    <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-muted">
                      <img
                        src={aw.images?.[0] ?? ""}
                        alt={aw.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex items-end justify-between mt-4 px-1">
                      <div>
                        <h3 className="font-serif text-xl group-hover:text-accent transition-colors">{aw.title}</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          {aw.medium && <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">{aw.medium}</span>}
                          {aw.dimensions && <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">{aw.dimensions}</span>}
                          {aw.year && <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">{aw.year}</span>}
                        </div>
                      </div>
                      {aw.isForSale && aw.price && (
                        <span className="text-xs text-accent shrink-0">{aw.price}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Dots */}
            {slideCount > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: slideCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                      i === activeSlide ? "bg-accent" : "bg-border hover:bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Full artwork grid */}
      {works.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
          <div className="border-t border-border/60 pt-12">
            <h2 className="font-serif text-2xl md:text-3xl mb-8">All Works{works.length > 6 ? ` (${works.length})` : ""}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((aw: any) => (
                <Link key={aw.id} to="/artworks/$publicId" params={{ publicId: aw.publicId }} className="group block">
                  <div className="aspect-[4/3] overflow-hidden bg-muted rounded-xl border border-border">
                    <img
                      src={aw.images?.[0] ?? ""}
                      alt={aw.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-lg group-hover:text-accent transition-colors">{aw.title}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      {aw.medium && <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">{aw.medium}</span>}
                      {aw.dimensions && <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">{aw.dimensions}</span>}
                      {aw.year && <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">{aw.year}</span>}
                    </div>
                    {aw.isForSale && aw.price && (
                      <p className="text-xs text-accent mt-1.5">{aw.price}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!hasCarousel && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
          <div className="border-t border-border/60 pt-12">
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No artworks in the portfolio yet.</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
