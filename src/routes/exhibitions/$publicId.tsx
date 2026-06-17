import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Ticket, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getExhibitionByPublicId } from "@/lib/api";

export const Route = createFileRoute("/exhibitions/$publicId")({
  head: () => ({ meta: [{ title: "Exhibition — Akenga Arts Centre" }] }),
  component: ExhibitionDetail,
});

function ExhibitionDetail() {
  const { publicId } = useParams({ from: "/exhibitions/$publicId" });
  const [activeImage, setActiveImage] = useState(0);

  const { data: exhibition, isLoading } = useQuery({
    queryKey: ["exhibition", publicId],
    queryFn: () => getExhibitionByPublicId({ data: { publicId } }),
    enabled: !!publicId,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center pt-20"><p className="text-muted-foreground text-sm">Loading...</p></div>;
  if (!exhibition) return <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4"><p className="text-muted-foreground">Exhibition not found.</p><Link to="/exhibitions" className="text-xs tracking-[0.2em] uppercase text-accent">Back to Exhibitions</Link></div>;

  const images: string[] = (exhibition.images && exhibition.images.length > 0) ? exhibition.images : (exhibition.imageUrl ? [exhibition.imageUrl] : []);
  const hasMultiple = images.length > 1;

  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);

  const isLive = exhibition.isLive;
  const guests = exhibition.guestAppearances ? exhibition.guestAppearances.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  return (
    <>
      <section className="pt-36 pb-8 max-w-7xl mx-auto px-6 lg:px-10">
        <Link to="/exhibitions" className="inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />Exhibitions
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border">
              {images.length > 0 ? (
                <>
                  <img src={images[activeImage]} alt={`${exhibition.title} — ${activeImage + 1}`} className="w-full h-full object-cover" />
                  {hasMultiple && (
                    <>
                      <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center cursor-pointer"><ChevronLeft className="h-5 w-5" /></button>
                      <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center cursor-pointer"><ChevronRight className="h-5 w-5" /></button>
                    </>
                  )}
                </>
              ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>}
              {isLive && <Badge className="absolute top-3 left-3 bg-emerald-500 text-white text-[0.65rem]">Live Now</Badge>}
              {exhibition.tag && <span className="absolute top-3 right-3 bg-foreground/90 text-background text-[0.6rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded">{exhibition.tag}</span>}
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

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="eyebrow">{isLive ? "Now Showing" : "Exhibition"}</p>
            <h1 className="font-serif text-3xl md:text-5xl mt-3">{exhibition.title}</h1>

            {/* Key details */}
            <div className="flex flex-wrap gap-3 mt-6">
              {exhibition.startDate && (
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {exhibition.startDate}{exhibition.endDate ? ` — ${exhibition.endDate}` : ""}
                </div>
              )}
              {exhibition.location && (
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {exhibition.location}
                </div>
              )}
            </div>

            {exhibition.venue && (
              <p className="text-xs text-muted-foreground mt-1">{exhibition.venue}</p>
            )}

            <div className="h-px w-24 bg-accent/50 my-6" />

            {/* Ticket info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">
                  {exhibition.ticketType === "FREE" ? "Free Admission" : exhibition.ticketType === "BUNDLE" ? "Bundle Ticket" : "Paid Entry"}
                </span>
              </div>
              {exhibition.ticketPrice && (
                <p className="text-sm text-muted-foreground ml-6">{exhibition.ticketPrice}</p>
              )}
              {exhibition.ticketUrl && (
                <a href={exhibition.ticketUrl} target="_blank" rel="noopener" className="ml-6 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  <ExternalLink className="h-3 w-3" />Get Tickets
                </a>
              )}
            </div>

            {/* Guest appearances */}
            {guests.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-accent" />
                  <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Guest Appearances</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {guests.map((g, i) => (
                    <Badge key={i} variant="secondary" className="text-[0.65rem]">{g}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {exhibition.description && (
              <div className="mt-6">
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">About</h3>
                <p className="text-sm md:text-base leading-relaxed text-foreground/80 whitespace-pre-line">{exhibition.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
