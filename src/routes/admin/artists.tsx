import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getAllArtists, createArtist, updateArtist, deleteArtist } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/admin/artists")({ component: AdminArtists });

function AdminArtists() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: list } = useQuery({ queryKey: ["artists", "admin"], queryFn: () => getAllArtists() });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const openCreate = () => { setEditingId(null); reset({}); setOpen(true); };
  const openEdit = (a: any) => {
    setEditingId(a.id);
    reset({ name: a.name, bio: a.bio || "", profileImage: a.profileImage || "", website: a.website || "", email: a.email || "" });
    setOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await updateArtist({ data: { id: editingId, ...data } });
        toast.success("Artist updated");
      } else {
        await createArtist({ data });
        toast.success("Artist created");
      }
      qc.invalidateQueries({ queryKey: ["artists"] });
      setOpen(false);
    } catch { toast.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteArtist({ data: { id } });
    toast.success("Artist deleted");
    qc.invalidateQueries({ queryKey: ["artists"] });
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl">Artists</h1>
          <p className="mt-2 text-muted-foreground text-sm">Manage artist profiles.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Artist</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6"><SheetTitle>{editingId ? "Edit" : "Create"} Artist</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><Label htmlFor="name">Name *</Label><Input id="name" {...register("name")} />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
              <div><Label htmlFor="email">Email</Label><Input id="email" {...register("email")} placeholder="artist@example.com" /></div>
              <div><Label htmlFor="website">Website</Label><Input id="website" {...register("website")} placeholder="https://..." /></div>
              <div><Label htmlFor="profileImage">Profile Image URL</Label><Input id="profileImage" {...register("profileImage")} placeholder="https://..." /></div>
              <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" {...register("bio")} rows={4} /></div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingId ? "Update" : "Create"} Artist</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {list && list.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No artists yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(list || []).map((a: any) => (
            <div key={a.id} className={`rounded-xl border border-border p-5 space-y-3 ${a.status === "DELETED" ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-muted border overflow-hidden shrink-0">
                  {a.profileImage ? <img src={a.profileImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-serif">{(a.name || "?")[0]}</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{a.name}</p>
                  {a.email && <p className="text-xs text-muted-foreground truncate">{a.email}</p>}
                  {a.website && <a href={a.website} target="_blank" rel="noopener" className="text-xs text-accent hover:underline inline-flex items-center gap-0.5"><ExternalLink className="h-3 w-3" />Website</a>}
                </div>
              </div>
              {a.bio && <p className="text-xs text-muted-foreground line-clamp-2">{a.bio}</p>}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Badge variant="secondary" className="text-[0.6rem]">{a.status}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(a.id, a.name)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
