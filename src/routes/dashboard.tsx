import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"; import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Loader2, Upload, X, LogOut, Palette, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"; import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUser, logout, getAllArtists, getArtworksByArtist, getArtworks, getExhibitionsByArtist, createArtwork, updateArtwork, deleteArtwork, createExhibition, getExhibitions, uploadImageFn, updateArtist } from "@/lib/api";

const awSchema = z.object({ title: z.string().min(1), description: z.string().optional(), medium: z.string().optional(), dimensions: z.string().optional(), year: z.string().optional(), images: z.array(z.string()).optional(), category: z.string().optional(), isForSale: z.boolean().optional(), price: z.string().optional() });
type AW = z.infer<typeof awSchema>;

const exSchema = z.object({ title: z.string().min(1), description: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), location: z.string().optional(), venue: z.string().optional(), ticketType: z.enum(["FREE","PAID","BUNDLE"]).optional(), ticketPrice: z.string().optional(), ticketUrl: z.string().optional(), guestAppearances: z.string().optional(), images: z.array(z.string()).optional() });
type EX = z.infer<typeof exSchema>;

const artistSchema = z.object({ name: z.string().min(1), bio: z.string().optional(), nationality: z.string().optional(), website: z.string().optional(), instagram: z.string().optional(), tiktok: z.string().optional(), twitter: z.string().optional(), profileImage: z.string().optional(), profileVisible: z.boolean().optional() });
type AF = z.infer<typeof artistSchema>;

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Akenga Arts Centre" }] }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ["currentUser"], queryFn: () => { const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : ""; return getCurrentUser({ data: { token } }); } });
  const { data: allArtists, isLoading: artistsLoading } = useQuery({ queryKey: ["artists"], queryFn: () => getAllArtists() });
  const artist = allArtists?.find((a: any) => a.userId === user?.id) || allArtists?.find((a: any) => a.email === user?.email);
  const { data: artworks } = useQuery({ queryKey: ["artworks","artist",artist?.id], queryFn: () => getArtworksByArtist({ data: { artistId: artist!.id } }), enabled: !!artist?.id });
  const { data: exhibitions } = useQuery({ queryKey: ["exhibitions","artist",artist?.id], queryFn: () => getExhibitionsByArtist({ data: { artistId: artist!.id } }), enabled: !!artist?.id });

  const handleLogout = () => { logout(); localStorage.removeItem("auth_token"); localStorage.removeItem("auth_user"); window.location.href = "/"; };

  if (userLoading || artistsLoading) return <div className="min-h-screen flex items-center justify-center pt-20"><p className="text-muted-foreground text-sm">Loading...</p></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center pt-20"><p className="text-muted-foreground">Please <Link to="/login" className="text-accent">sign in</Link>.</p></div>;
  if (user.role !== "artist" && user.role !== "admin") return <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4"><p className="text-muted-foreground">Artist dashboard access only.</p><Link to="/" className="text-xs text-accent">Go Home</Link></div>;
  if (!artist) return <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4"><p className="text-muted-foreground">No artist profile linked. Contact admin.</p><Link to="/" className="text-xs text-accent">Go Home</Link></div>;

  return (
    <div className="min-h-screen pt-24 pb-16 max-w-5xl mx-auto px-6 lg:px-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden border">{artist.profileImage ? <img src={artist.profileImage} alt="" className="w-full h-full object-cover"/> : <Palette className="w-6 h-6 m-3 text-muted-foreground"/>}</div>
          <div><h1 className="font-serif text-2xl md:text-3xl">{artist.name}</h1><p className="text-xs text-muted-foreground">{user.email}</p></div>
        </div>
        <div className="flex gap-2">
          <EditProfile artist={artist} qc={qc} />
          <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-4 w-4"/></Button>
        </div>
      </div>

      {/* Welcome banner for incomplete profiles */}
      {(!artist.bio && !artist.profileImage) && (
        <div className="mb-8 p-5 rounded-xl border border-accent/30 bg-accent/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <p className="font-serif text-lg">Welcome, {artist.name}!</p>
            <p className="text-sm text-muted-foreground mt-1">Complete your artist profile to start uploading artworks and creating exhibitions.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <EditProfile artist={artist} qc={qc} />
            <Button variant="outline" size="sm" asChild><Link to="/shop">Browse Shop</Link></Button>
          </div>
        </div>
      )}

      {/* Artworks section */}
      <Section title="My Artworks" count={artworks?.length} createLabel="Add Artwork" qc={qc} artistId={artist.id}>
        <AddArtwork artistId={artist.id} qc={qc} />
      </Section>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {(artworks||[]).map((aw:any)=>(<ArtworkCard key={aw.id} aw={aw} artistId={artist.id} qc={qc}/>))}
      </div>

      {/* Exhibitions section */}
      <Section title="My Exhibitions" count={exhibitions?.length} createLabel="Create Exhibition" qc={qc} artistId={artist.id}>
        <AddExhibition artistId={artist.id} qc={qc} />
      </Section>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(exhibitions||[]).map((ex:any)=>(<div key={ex.id} className="rounded-xl border border-border p-4"><p className="font-medium text-sm">{ex.title}</p><div className="flex gap-2 mt-2"><Badge variant="outline" className="text-[0.6rem]">{ex.approvalStatus||"APPROVED"}</Badge>{ex.startDate&&<span className="text-[0.6rem] text-muted-foreground">{ex.startDate}</span>}</div></div>))}
      </div>
    </div>
  );
}

function Section({ title, count, createLabel, children, qc, artistId }: any) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-serif text-xl">{title}{count !== undefined ? ` (${count})` : ""}</h2>
      <Sheet>
        <SheetTrigger asChild><Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1"/>{createLabel}</Button></SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6"><SheetTitle>{createLabel}</SheetTitle></SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EditProfile({ artist, qc }: { artist: any; qc: any }) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false); const fr = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, watch, reset } = useForm<AF>({ resolver: zodResolver(artistSchema) });
  const img = watch("profileImage");
  const u = async (f:File):Promise<string> => new Promise((r,j)=>{const rd=new FileReader();rd.onload=async()=>{const u=await uploadImageFn({data:{base64:rd.result as string,filename:f.name,alt:f.name}});r(u.url)};rd.onerror=j;rd.readAsDataURL(f)});

  const handleOpen = (o: boolean) => {
    setOpen(o);
    if (o && artist) {
      reset({
        name: artist.name || "",
        bio: artist.bio || "",
        nationality: artist.nationality || "",
        website: artist.website || "",
        instagram: artist.instagram || "",
        tiktok: artist.tiktok || "",
        twitter: artist.twitter || "",
        profileImage: artist.profileImage || "",
        profileVisible: artist.profileVisible ?? false,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild><Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5 mr-1"/>Edit Profile</Button></SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto"><SheetHeader className="mb-6"><SheetTitle>Edit Profile</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(async(d)=>{setSubmitting(true);try{const updated = await updateArtist({data:{...d,id:artist.id}});toast.success("Saved");qc.setQueryData(["artists"], (old: any) => old ? old.map((a: any) => a.id === artist.id ? { ...a, ...d, profileVisible: d.profileVisible } : a) : old);setOpen(false)}catch{toast.error("Failed")}finally{setSubmitting(false)}})} className="space-y-4">
          <div><Label>Name *</Label><Input {...register("name")}/></div>
          <div><Label>Nationality</Label><Input {...register("nationality")}/></div>
          <div><Label>Website</Label><Input {...register("website")}/></div>
          <div><Label>Instagram</Label><Input {...register("instagram")}/></div>
          <div><Label>TikTok</Label><Input {...register("tiktok")}/></div>
          <div><Label>X (Twitter)</Label><Input {...register("twitter")}/></div>
          <div><Label>Profile Image</Label><div className="flex gap-2 mt-1"><Input className="flex-1" {...register("profileImage")} placeholder="URL or upload"/><Button type="button" variant="outline" size="icon" disabled={uploading} onClick={()=>fr.current?.click()}><Upload className="h-4 w-4"/></Button><input ref={fr} type="file" accept="image/*" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;setUploading(true);try{setValue("profileImage",await u(f))}catch{toast.error("Upload failed")}finally{setUploading(false)}}}/></div>{img&&<img src={img} alt="" className="w-16 h-16 object-cover rounded-lg mt-2"/>}</div>
          <div><Label>Bio</Label><Textarea {...register("bio")} rows={4}/></div>
          <div className="flex items-center justify-between"><Label>Profile Visibility</Label><Switch checked={watch("profileVisible")} onCheckedChange={v => setValue("profileVisible", v)} /><p className="text-[0.6rem] text-muted-foreground -mt-1">Show my artist profile publicly</p></div>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting&&<Loader2 className="h-4 w-4 mr-2 animate-spin"/>}Save</Button>
        </form></SheetContent></Sheet>
  );
}

function AddArtwork({ artistId, qc }: { artistId: number; qc: any }) {
  const [s, setS] = useState(false); const [up, setUp] = useState(false); const fr = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<AW>({ resolver: zodResolver(awSchema), defaultValues: { images: [], isForSale: false } });
  const images = watch("images")||[];
  const u = async (f:File):Promise<string> => new Promise((r,j)=>{const rd=new FileReader();rd.onload=async()=>{const u=await uploadImageFn({data:{base64:rd.result as string,filename:f.name,alt:f.name}});r(u.url)};rd.onerror=j;rd.readAsDataURL(f)});
  return (
    <form onSubmit={handleSubmit(async (d)=>{setS(true);try{await createArtwork({data:{...d,artistId,approvalStatus:"PENDING"}});toast.success("Artwork submitted for approval");qc.invalidateQueries()}catch{toast.error("Failed")}finally{setS(false)}})} className="space-y-4">
      <div><Label>Title *</Label><Input {...register("title")}/>{errors.title&&<p className="text-xs text-destructive mt-1">{errors.title.message}</p>}</div>
      <div><Label>Medium</Label><Input {...register("medium")}/></div>
      <div className="grid grid-cols-2 gap-3"><div><Label>Year</Label><Input {...register("year")}/></div><div><Label>Dimensions</Label><Input {...register("dimensions")}/></div></div>
      <div><Label>Category</Label><Input {...register("category")}/></div>
      <div><Label>Description</Label><Textarea {...register("description")} rows={3}/></div>
      <div><Label>Images</Label><div className="flex flex-wrap gap-2 mt-2">{(images||[]).map((u,i)=>(<div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden"><img src={u} alt="" className="w-full h-full object-cover"/><button type="button" onClick={()=>setValue("images",images.filter((_,j)=>j!==i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="h-2.5 w-2.5"/></button></div>))}<button type="button" onClick={()=>fr.current?.click()} disabled={up} className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-accent"><Upload className="h-4 w-4"/></button></div><input ref={fr} type="file" accept="image/*" multiple className="hidden" onChange={async e=>{const fs=e.target.files;if(!fs)return;setUp(true);const upld:string[]=[];for(const f of Array.from(fs)){try{upld.push(await u(f))}catch{toast.error(`Failed: ${f.name}`)}}setValue("images",[...(getValues("images")||[]),...upld]);setUp(false);if(fr.current)fr.current.value=""}}/></div>
      <div className="flex items-center justify-between"><Label>For Sale</Label><Switch {...register("isForSale")} onCheckedChange={v=>setValue("isForSale",v)}/></div>
      <div><Label>Price</Label><Input {...register("price")} placeholder="KES 25,000"/></div>
      <Button type="submit" className="w-full" disabled={s}>{s&&<Loader2 className="h-4 w-4 mr-2 animate-spin"/>}Submit Artwork</Button>
    </form>
  );
}

function ArtworkCard({ aw, artistId, qc }: { aw: any; artistId: number; qc: any }) {
  const [ed, setEd] = useState(false); const [s, setS] = useState(false);
  const { register, handleSubmit, setValue, watch, reset } = useForm<AW>({ defaultValues: aw });
  return ed ? (
    <div className="rounded-xl border border-border p-4 space-y-2"><Input {...register("title")}/><Input {...register("medium")}/><Textarea {...register("description")} rows={2}/>
      <div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>setEd(false)}>Cancel</Button><Button size="sm" disabled={s} onClick={handleSubmit(async(d)=>{setS(true);try{await updateArtwork({data:{...d,id:aw.id}});toast.success("Saved");qc.invalidateQueries();setEd(false)}catch{toast.error("Failed")}finally{setS(false)}})}>{s&&<Loader2 className="h-3 w-3 animate-spin"/>}Save</Button></div></div>
  ) : (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="aspect-[4/3] bg-muted">{aw.images?.[0]?<img src={aw.images[0]} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>}</div>
      <div className="p-3"><p className="font-medium text-sm line-clamp-1">{aw.title}</p>
        <div className="flex gap-1 mt-1"><Badge variant="outline" className="text-[0.6rem]">{aw.approvalStatus||"APPROVED"}</Badge>{aw.medium&&<Badge variant="secondary" className="text-[0.6rem]">{aw.medium}</Badge>}</div>
        <div className="flex justify-end gap-1 mt-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>setEd(true)}><Pencil className="h-3 w-3"/></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>{if(confirm("Delete?")){deleteArtwork({data:{id:aw.id}});qc.invalidateQueries()}}}><Trash2 className="h-3 w-3 text-destructive"/></Button></div></div></div>
  );
}

function AddExhibition({ artistId, qc }: { artistId: number; qc: any }) {
  const [s, setS] = useState(false); const [up, setUp] = useState(false); const fr = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, watch, getValues, formState:{errors} } = useForm<EX>({ resolver: zodResolver(exSchema), defaultValues: { images: [], ticketType: "FREE" } });
  const images = watch("images")||[];
  const u = async (f:File):Promise<string> => new Promise((r,j)=>{const rd=new FileReader();rd.onload=async()=>{const u=await uploadImageFn({data:{base64:rd.result as string,filename:f.name,alt:f.name}});r(u.url)};rd.onerror=j;rd.readAsDataURL(f)});
  return (
    <form onSubmit={handleSubmit(async(d)=>{setS(true);try{await createExhibition({data:{...d,artistId,approvalStatus:"PENDING"}});toast.success("Exhibition submitted for approval");qc.invalidateQueries()}catch{toast.error("Failed")}finally{setS(false)}})} className="space-y-4">
      <div><Label>Title *</Label><Input {...register("title")}/>{errors.title&&<p className="text-xs text-destructive mt-1">{errors.title.message}</p>}</div>
      <div className="grid grid-cols-2 gap-3"><div><Label>Start Date</Label><Input type="date" {...register("startDate")}/></div><div><Label>End Date</Label><Input type="date" {...register("endDate")}/></div></div>
      <div className="grid grid-cols-2 gap-3"><div><Label>Location</Label><Input {...register("location")}/></div><div><Label>Venue</Label><Input {...register("venue")}/></div></div>
      <div><Label>Guest Appearances</Label><Input {...register("guestAppearances")}/></div>
      <div><Label>Ticket Type</Label>
        <Select value={watch("ticketType") || "FREE"} onValueChange={v => setValue("ticketType", v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="BUNDLE">Bundle</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Price</Label><Input {...register("ticketPrice")}/></div>
      <div><Label>Ticket URL</Label><Input {...register("ticketUrl")}/></div>
      <div><Label>Description</Label><Textarea {...register("description")} rows={3}/></div>
      <div><Label>Images</Label><div className="flex flex-wrap gap-2 mt-2">{(images||[]).map((u,i)=>(<div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden"><img src={u} alt="" className="w-full h-full object-cover"/><button type="button" onClick={()=>setValue("images",images.filter((_,j)=>j!==i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="h-2.5 w-2.5"/></button></div>))}<button type="button" onClick={()=>fr.current?.click()} disabled={up} className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-accent"><Upload className="h-4 w-4"/></button></div><input ref={fr} type="file" accept="image/*" multiple className="hidden" onChange={async e=>{const fs=e.target.files;if(!fs)return;setUp(true);const upld:string[]=[];for(const f of Array.from(fs)){try{upld.push(await u(f))}catch{toast.error(`Failed: ${f.name}`)}}setValue("images",[...(getValues("images")||[]),...upld]);setUp(false);if(fr.current)fr.current.value=""}}/></div>
      <Button type="submit" className="w-full" disabled={s}>{s&&<Loader2 className="h-4 w-4 mr-2 animate-spin"/>}Submit Exhibition</Button>
    </form>
  );
}
