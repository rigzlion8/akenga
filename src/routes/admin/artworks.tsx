import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getArtworks, createArtwork, updateArtwork, deleteArtwork, toggleFeatured, getAllArtists, uploadImageFn } from "@/lib/api";

const formSchema = z.object({
  artistId: z.string().min(1, "Artist is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  year: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  isForSale: z.boolean().optional(),
  price: z.string().optional(),
  featured: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/admin/artworks")({ component: AdminArtworks });

function AdminArtworks() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: list } = useQuery({ queryKey: ["artworks", "admin"], queryFn: () => getArtworks() });
  const { data: artistList } = useQuery({ queryKey: ["artists"], queryFn: () => getAllArtists() });

  const { register, handleSubmit, reset, setValue, watch, getValues, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { images: [], isForSale: false, featured: false },
  });

  const images = watch("images") || [];

  const openCreate = () => { setEditingId(null); reset({ images: [], isForSale: false, featured: false }); setOpen(true); };
  const openEdit = (aw: any) => {
    setEditingId(aw.id);
    reset({
      artistId: String(aw.artistId), title: aw.title, description: aw.description || "",
      medium: aw.medium || "", dimensions: aw.dimensions || "", year: aw.year || "",
      images: aw.images || [], category: aw.category || "", tag: aw.tag || "",
      isForSale: aw.isForSale ?? false, price: aw.price || "", featured: aw.featured ?? false,
    });
    setOpen(true);
  };

  const uploadImage = async (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = await uploadImageFn({ data: { base64: reader.result as string, filename: file.name, alt: file.name } });
      resolve(result.url);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const f of Array.from(files)) {
      try { const url = await uploadImage(f); uploaded.push(url); } catch { toast.error(`Failed: ${f.name}`); }
    }
    // Read current images from form state to avoid stale closure
    const current = getValues("images") || [];
    setValue("images", [...current, ...uploaded]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (i: number) => setValue("images", images.filter((_, idx) => idx !== i));

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const payload = { ...data, artistId: Number(data.artistId) };
      if (editingId) { await updateArtwork({ data: { id: editingId, ...payload } }); toast.success("Updated"); }
      else { await createArtwork({ data: payload }); toast.success("Created"); }
      qc.invalidateQueries({ queryKey: ["artworks"] });
      setOpen(false);
    } catch { toast.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await deleteArtwork({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["artworks"] });
  };

  const handleFeatured = async (id: number, current: boolean) => {
    await toggleFeatured({ data: { id, featured: !current } });
    qc.invalidateQueries({ queryKey: ["artworks"] });
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl">Artworks</h1>
          <p className="mt-2 text-muted-foreground text-sm">Manage artworks across all artists.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Artwork</Button></SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6"><SheetTitle>{editingId ? "Edit" : "Create"} Artwork</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Artist *</Label>
                <Controller name="artistId" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select artist" /></SelectTrigger>
                    <SelectContent>
                      {(artistList || []).map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
                {errors.artistId && <p className="text-xs text-destructive mt-1">{errors.artistId.message}</p>}
              </div>
              <div><Label htmlFor="title">Title *</Label><Input id="title" {...register("title")} />{errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}</div>
              <div><Label htmlFor="medium">Medium</Label><Input id="medium" {...register("medium")} placeholder="Oil on canvas, Digital, etc." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="dimensions">Dimensions</Label><Input id="dimensions" {...register("dimensions")} placeholder='24" x 36"' /></div>
                <div><Label htmlFor="year">Year</Label><Input id="year" {...register("year")} placeholder="2026" /></div>
              </div>
              <div><Label htmlFor="description">Description</Label><Textarea id="description" {...register("description")} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="category">Category</Label><Input id="category" {...register("category")} /></div>
                <div><Label htmlFor="tag">Tag</Label><Input id="tag" {...register("tag")} /></div>
              </div>
              <div>
                <Label>Images</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"><X className="h-2.5 w-2.5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-accent cursor-pointer"><Upload className="h-4 w-4" /></button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
              </div>
              <div className="flex items-center justify-between">
                <Label>For Sale</Label>
                <Controller name="isForSale" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
              </div>
              <div><Label htmlFor="price">Price</Label><Input id="price" {...register("price")} placeholder="KES 25,000" /></div>
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Controller name="featured" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingId ? "Update" : "Create"} Artwork</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {list && list.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No artworks yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(list || []).map((aw: any) => (
            <div key={aw.id} className={`rounded-xl border border-border overflow-hidden ${aw.status === "DELETED" ? "opacity-50" : ""}`}>
              <div className="aspect-[4/3] bg-muted relative">
                {aw.images?.[0] ? <img src={aw.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>}
                <button onClick={() => handleFeatured(aw.id, aw.featured)} className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${aw.featured ? "bg-accent text-accent-foreground" : "bg-background/80 text-muted-foreground hover:text-accent"}`}><Star className="h-3.5 w-3.5" fill={aw.featured ? "currentColor" : "none"} /></button>
              </div>
              <div className="p-4 space-y-2">
                <p className="font-medium text-sm line-clamp-1">{aw.title}</p>
                <div className="flex flex-wrap gap-1">
                  {aw.medium && <Badge variant="secondary" className="text-[0.6rem]">{aw.medium}</Badge>}
                  {aw.year && <Badge variant="outline" className="text-[0.6rem]">{aw.year}</Badge>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">{aw.isForSale ? aw.price : "Not for sale"}</span>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(aw)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(aw.id, aw.title)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
