import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod"; import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, Loader2, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"; import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getExhibitions, createExhibition, updateExhibition, deleteExhibition, getAllArtists, uploadImageFn } from "@/lib/api";

const schema = z.object({
  title: z.string().min(1), description: z.string().optional(), artistId: z.string().optional(),
  artistName: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(),
  location: z.string().optional(), venue: z.string().optional(),
  ticketType: z.enum(["FREE", "PAID", "BUNDLE"]).optional(), ticketPrice: z.string().optional(),
  ticketUrl: z.string().optional(), guestAppearances: z.string().optional(),
  tag: z.string().optional(), imageUrl: z.string().optional(), images: z.array(z.string()).optional(),
  isLive: z.boolean().optional(), featured: z.boolean().optional(),
});
type F = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/exhibitions")({ component: AdminExhibitions });

function AdminExhibitions() {
  const qc = useQueryClient(); const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false); const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: list } = useQuery({ queryKey: ["exhibitions", "admin"], queryFn: () => getExhibitions() });
  const { data: artists } = useQuery({ queryKey: ["artists"], queryFn: () => getAllArtists() });
  const { register, handleSubmit, reset, setValue, watch, getValues, control, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { images: [], isLive: false, featured: false, ticketType: "FREE" } });
  const images = watch("images") || [];

  const openCreate = () => { setEditingId(null); reset({ images: [], isLive: false, featured: false, ticketType: "FREE" }); setOpen(true); };
  const openEdit = (ex: any) => { setEditingId(ex.id); reset({ title: ex.title, description: ex.description || "", artistId: ex.artistId ? String(ex.artistId) : "", artistName: ex.artistName || "", startDate: ex.startDate || "", endDate: ex.endDate || "", location: ex.location || "", venue: ex.venue || "", ticketType: ex.ticketType || "FREE", ticketPrice: ex.ticketPrice || "", ticketUrl: ex.ticketUrl || "", guestAppearances: ex.guestAppearances || "", tag: ex.tag || "", imageUrl: ex.imageUrl || "", images: ex.images || [], isLive: ex.isLive ?? false, featured: ex.featured ?? false }); setOpen(true); };

  const upload = async (f: File): Promise<string> => new Promise((res, rej) => { const r = new FileReader(); r.onload = async () => { const u = await uploadImageFn({ data: { base64: r.result as string, filename: f.name, alt: f.name } }); res(u.url); }; r.onerror = rej; r.readAsDataURL(f); });

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return; setUploading(true);
    const up: string[] = []; for (const f of Array.from(files)) { try { up.push(await upload(f)); } catch { toast.error(`Failed: ${f.name}`); } }
    setValue("images", [...(getValues("images") || []), ...up]); setUploading(false); if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (d: F) => { setSubmitting(true); try { const p = { ...d, artistId: d.artistId ? Number(d.artistId) : null }; if (editingId) { await updateExhibition({ data: { id: editingId, ...p } }); toast.success("Updated"); } else { await createExhibition({ data: p }); toast.success("Created"); } qc.invalidateQueries({ queryKey: ["exhibitions"] }); setOpen(false); } catch { toast.error("Failed"); } finally { setSubmitting(false); } };

  return (<>
    <div className="flex items-center justify-between gap-4 mb-6"><div><h1 className="font-serif text-3xl md:text-5xl">Exhibitions</h1><p className="mt-2 text-muted-foreground text-sm">Manage exhibitions across the centre.</p></div>
      <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Exhibition</Button></SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto"><SheetHeader className="mb-6"><SheetTitle>{editingId ? "Edit" : "Create"} Exhibition</SheetTitle></SheetHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><Label>Title *</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}</div>
            <div><Label>Artist</Label><Controller name="artistId" control={control} render={({ field }) => (<Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Select artist" /></SelectTrigger><SelectContent>{(artists||[]).map((a:any)=><SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select>)} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Start Date</Label><Input type="date" {...register("startDate")} /></div><div><Label>End Date</Label><Input type="date" {...register("endDate")} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Location</Label><Input {...register("location")} placeholder="City, Country" /></div><div><Label>Venue</Label><Input {...register("venue")} placeholder="Gallery name" /></div></div>
            <div><Label>Guest Appearances</Label><Input {...register("guestAppearances")} placeholder="Names, comma separated" /></div>
            <div className="border-t border-border pt-4"><p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Tickets</p>
              <div className="space-y-3"><div><Label>Type</Label><Controller name="ticketType" control={control} render={({ field }) => (<Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FREE">Free</SelectItem><SelectItem value="PAID">Paid</SelectItem><SelectItem value="BUNDLE">Bundle</SelectItem></SelectContent></Select>)} /></div>
                <div><Label>Price</Label><Input {...register("ticketPrice")} placeholder="KES 500 or Free" /></div>
                <div><Label>Ticket URL</Label><Input {...register("ticketUrl")} placeholder="https://tickets.example.com" /></div></div></div>
            <div><Label>Description</Label><Textarea {...register("description")} rows={3} /></div>
            <div><Label>Tag</Label><Input {...register("tag")} /></div>
            <div><Label>Images</Label><div className="mt-2 flex flex-wrap gap-2">{images.map((url,i)=>(<div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted"><img src={url} alt="" className="w-full h-full object-cover" /><button type="button" onClick={()=>setValue("images",images.filter((_,j)=>j!==i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"><X className="h-2.5 w-2.5"/></button></div>))}<button type="button" onClick={()=>fileRef.current?.click()} disabled={uploading} className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-accent cursor-pointer"><Upload className="h-4 w-4"/></button></div><input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} /></div>
            <div className="flex items-center justify-between"><Label>Live</Label><Controller name="isLive" control={control} render={({field})=><Switch checked={field.value} onCheckedChange={field.onChange}/>}/></div>
            <div className="flex items-center justify-between"><Label>Featured</Label><Controller name="featured" control={control} render={({field})=><Switch checked={field.value} onCheckedChange={field.onChange}/>}/></div>
            <Button type="submit" className="w-full" disabled={submitting}>{submitting&&<Loader2 className="h-4 w-4 mr-2 animate-spin"/>}{editingId?"Update":"Create"} Exhibition</Button>
          </form></SheetContent></Sheet></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{(list||[]).map((ex:any)=>(<div key={ex.id} className={`rounded-xl border border-border overflow-hidden ${ex.status==="DELETED"?"opacity-50":""}`}><div className="aspect-[16/9] bg-muted relative">{ex.images?.[0]?<img src={ex.images[0]} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>}{ex.isLive&&<Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-[0.6rem]">Live</Badge>}</div><div className="p-4 space-y-2"><p className="font-medium text-sm line-clamp-1">{ex.title}</p><div className="flex flex-wrap gap-1">{(ex.artistId&&artists)&&<Badge variant="secondary" className="text-[0.6rem]">{artists.find((a:any)=>a.id===ex.artistId)?.name||"Artist"}</Badge>}<Badge variant="outline" className="text-[0.6rem]">{ex.ticketType||"FREE"}</Badge></div><div className="flex flex-wrap gap-2 text-[0.6rem] text-muted-foreground">{ex.location&&<span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3"/>{ex.location}</span>}{ex.startDate&&<span className="inline-flex items-center gap-0.5"><Calendar className="h-3 w-3"/>{ex.startDate}</span>}</div><div className="flex justify-end gap-0.5 pt-2 border-t border-border"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>openEdit(ex)}><Pencil className="h-3 w-3"/></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>{if(confirm(`Delete "${ex.title}"?`)){deleteExhibition({data:{id:ex.id}});toast.success("Deleted");qc.invalidateQueries({queryKey:["exhibitions"]})}}}><Trash2 className="h-3 w-3 text-destructive"/></Button></div></div></div>))}</div>
  </>);
}
