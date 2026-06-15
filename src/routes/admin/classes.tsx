import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2, Upload, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClasses, createClass, updateClass, deleteClass, uploadImageFn } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  style: z.string().min(1, "Style is required"),
  level: z.string().min(1, "Level is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  capacity: z.coerce.number().optional(),
  price: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/admin/classes")({
  component: AdminClasses,
});

function AdminClasses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: classes } = useQuery({
    queryKey: ["classes", "admin"],
    queryFn: () => getClasses(),
  });

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    if (!search.trim()) return classes;
    const q = search.toLowerCase();
    return classes.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.style?.toLowerCase().includes(q) ||
        c.level?.toLowerCase().includes(q),
    );
  }, [classes, search]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const imageUrl = watch("imageUrl") || "";

  const onOpen = (cls?: any) => {
    if (cls) {
      reset({
        name: cls.name,
        style: cls.style,
        level: cls.level,
        description: cls.description || "",
        imageUrl: cls.imageUrl || "",
        capacity: cls.capacity,
        price: cls.price || "",
      });
      setEditingId(cls.id);
    } else {
      reset({ name: "", style: "", level: "", description: "", imageUrl: "", capacity: undefined, price: "" });
      setEditingId(null);
    }
    setOpen(true);
  };

  const doUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = await uploadImageFn({
          data: { base64: reader.result as string, filename: file.name, alt: file.name },
        });
        resolve(result.url);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const url = await doUpload(file);
        setValue("imageUrl", url);
        toast.success("Image uploaded");
      } catch {
        toast.error("Failed to upload image");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setValue("imageUrl", "");
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await updateClass({ data: { id: editingId, ...data } });
        toast.success("Class updated");
      } else {
        await createClass({ data });
        toast.success("Class created");
      }
      reset();
      setEditingId(null);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    } catch {
      toast.error("Failed to save class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this class?")) return;
    try {
      await deleteClass({ data: { id } });
      toast.success("Class deleted");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    } catch {
      toast.error("Failed to delete class");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl">Classes</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage music classes offered at the Conservatory.
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={() => onOpen()}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingId ? "Edit Class" : "Add Class"}</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} placeholder="e.g. Piano" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="style">Style</Label>
                <Input id="style" {...register("style")} placeholder="e.g. Classical & Contemporary" />
                {errors.style && <p className="text-xs text-destructive mt-1">{errors.style.message}</p>}
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input id="level" {...register("level")} placeholder="e.g. All Levels" />
                {errors.level && <p className="text-xs text-destructive mt-1">{errors.level.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} placeholder="Description..." rows={3} />
              </div>
              <div>
                <Label>Image</Label>
                <div className="mt-2">
                  {imageUrl ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-muted mb-3">
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-40 h-40 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer mb-3"
                    >
                      {uploading ? (
                        <span className="text-xs">Uploading...</span>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          <span className="text-[0.6rem] mt-1 tracking-[0.2em] uppercase">Upload</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
                <Label htmlFor="imageUrl" className="text-xs text-muted-foreground">Or paste a URL</Label>
                <Input id="imageUrl" {...register("imageUrl")} placeholder="https://..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" {...register("capacity")} placeholder="10" />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input id="price" {...register("price")} placeholder="e.g. KES 5,000/month" />
              </div>
              <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Update Class" : "Create Class"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search classes by name, style, or level..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="mt-4 border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredClasses || filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                  {search.trim() ? "No classes match your search." : "No classes yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.style}</TableCell>
                  <TableCell className="text-muted-foreground">{c.level}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpen(c)}
                        className="cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id)}
                        className="text-destructive hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
