import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLiveExhibitions, getExhibitions } from "@/lib/api";

export const Route = createFileRoute("/exhibitions/")({
  head: () => ({ meta: [{ title: "Exhibitions — Akenga Arts Centre" }, { name: "description", content: "Current and upcoming exhibitions at Akenga Arts Centre." }] }),
  component: ExhibitionsIndex,
});

function ExhibitionsIndex() {
  const { data: live } = useQuery({ queryKey: ["exhibitions", "live"], queryFn: () => getLiveExhibitions() });
  const { data: all } = useQuery({ queryKey: ["exhibitions", "all"], queryFn: () => getExhibitions() });

  return (<>
    <section className="pt-36 pb-16 max-w-7xl mx-auto px-6 lg:px-10">
      <p className="eyebrow">What's On</p>
      <h1 className="font-serif text-4xl md:text-7xl mt-4">Exhibitions</h1>
      <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">Current and upcoming exhibitions from our resident artists and invited guests.</p>
    </section>

    {live && live.length > 0 && (<section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
      <p className="eyebrow mb-6">Now Showing</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {live.map((ex: any) => (<Link key={ex.id} to="/exhibitions/$publicId" params={{ publicId: ex.publicId }} className="group block">
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border relative">
            <img src={ex.images?.[0] ?? ex.imageUrl ?? ""} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <Badge className="absolute top-3 left-3 bg-emerald-500 text-white text-[0.6rem]">Live Now</Badge>
          </div>
          <p className="eyebrow mt-4">{ex.venue || ex.location || "Exhibition"}</p>
          <h2 className="font-serif text-2xl mt-2 group-hover:text-accent transition-colors">{ex.title}</h2>
          <div className="flex flex-wrap gap-3 mt-2 text-[0.65rem] text-muted-foreground">
            {ex.startDate && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{ex.startDate}{ex.endDate ? ` — ${ex.endDate}` : ""}</span>}
            {ex.ticketType && <Badge variant={ex.ticketType==="FREE"?"secondary":"outline"} className="text-[0.6rem]">{ex.ticketType==="FREE"?"Free":ex.ticketType==="BUNDLE"?"Bundle":"Paid"}{ex.ticketPrice ? ` · ${ex.ticketPrice}` : ""}</Badge>}
          </div>
        </Link>))}
      </div>
    </section>)}

    <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
      <div className="h-px w-40 bg-accent/50 mx-auto mb-12" />
      <h2 className="font-serif text-2xl md:text-3xl mb-8 text-center">All Exhibitions</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {(all || []).map((ex: any) => (<Link key={ex.id} to="/exhibitions/$publicId" params={{ publicId: ex.publicId }} className="group block">
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border">
            <img src={ex.images?.[0] ?? ex.imageUrl ?? ""} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <p className="eyebrow mt-4">{ex.venue || ex.location || "Exhibition"}</p>
          <h2 className="font-serif text-xl mt-2 group-hover:text-accent transition-colors">{ex.title}</h2>
          <div className="flex flex-wrap gap-3 mt-2 text-[0.65rem] text-muted-foreground">
            {ex.startDate && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{ex.startDate}</span>}
            {ex.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{ex.location}</span>}
            {ex.ticketType && <Badge variant={ex.ticketType==="FREE"?"secondary":"outline"} className="text-[0.6rem]">{ex.ticketType==="FREE"?"Free":"Paid"}{ex.ticketPrice?` · ${ex.ticketPrice}`:""}</Badge>}
          </div>
        </Link>))}
        {(!all || all.length===0)&&<div className="col-span-full text-center py-16 border border-dashed border-border rounded-xl"><p className="text-muted-foreground text-sm">No exhibitions yet.</p></div>}
      </div>
    </section>
  </>);
}
