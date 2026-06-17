import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getArtworkByPublicId, getArtistByPublicId } from "@/lib/api";

export const Route = createFileRoute("/artworks/$publicId")({
  head: () => ({ meta: [{ title: "Artwork — Akenga Arts Centre" }] }),
  component: ArtworkDetail,
});

function ArtworkDetail() {
  const { publicId } = useParams({ from: "/artworks/$publicId" });
  const [activeImage, setActiveImage] = useState(0);

  const { data: artwork, isLoading } = useQuery({
    queryKey: ["artwork", publicId],
    queryFn: () => getArtworkByPublicId({ data: { publicId } }),
    enabled: !!publicId,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center pt-20"><p className="text-muted-foreground text-sm">Loading...</p></div>;
  if (!artwork) return <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4"><p className="text-muted-foreground">Artwork not found.</p><Link to="/artists" className="text-xs tracking-[0.2em] uppercase text-accent">Back to Artists</Link></div>;

  const images: string[] = artwork.images ?? [];
  const hasMultiple = images.length > 1;

  return (
    <>
      <section className="pt-36 pb-8 max-w-7xl mx-auto px-6 lg:px-10">
        <Link to="/artists" className="inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"><ArrowLeft className="h-3.5 w-3.5" />Artists</Link>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border">
              {images.length > 0 ? (
                <>
                  <img src={images[activeImage]} alt={`${artwork.title} — ${activeImage + 1}`} className="w-full h-full object-cover" />
                  {hasMultiple && (
                    <>
                      <button onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center cursor-pointer"><ChevronLeft className="h-5 w-5" /></button>
                      <button onClick={() => setActiveImage(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center cursor-pointer"><ChevronRight className="h-5 w-5" /></button>
                    </>
                  )}
                </>
              ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>}
            </div>
            {hasMultiple && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((url, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${i === activeImage ? "border-accent" : "border-transparent hover:border-border"}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="eyebrow">{artwork.medium || "Artwork"}</p>
            <h1 className="font-serif text-3xl md:text-5xl mt-3">{artwork.title}</h1>

            <div className="flex flex-wrap gap-2 mt-4">
              {artwork.year && <span className="text-xs text-muted-foreground">{artwork.year}</span>}
              {artwork.dimensions && <span className="text-xs text-muted-foreground">{artwork.dimensions}</span>}
              {artwork.category && <span className="text-[0.6rem] tracking-[0.2em] uppercase bg-muted px-2 py-0.5 rounded">{artwork.category}</span>}
            </div>

            {artwork.description && (
              <div className="mt-6">
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">About this work</h3>
                <p className="text-sm md:text-base leading-relaxed text-foreground/80 whitespace-pre-line">{artwork.description}</p>
              </div>
            )}

            <div className="mt-6 border-t border-border/60 pt-6">
              <dl className="grid grid-cols-2 gap-3 text-xs">
                {artwork.medium && <div><dt className="text-muted-foreground tracking-[0.15em] uppercase mb-1">Medium</dt><dd>{artwork.medium}</dd></div>}
                {artwork.dimensions && <div><dt className="text-muted-foreground tracking-[0.15em] uppercase mb-1">Dimensions</dt><dd>{artwork.dimensions}</dd></div>}
                {artwork.year && <div><dt className="text-muted-foreground tracking-[0.15em] uppercase mb-1">Year</dt><dd>{artwork.year}</dd></div>}
                {artwork.category && <div><dt className="text-muted-foreground tracking-[0.15em] uppercase mb-1">Category</dt><dd>{artwork.category}</dd></div>}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
