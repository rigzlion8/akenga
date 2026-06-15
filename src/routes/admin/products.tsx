import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  uploadImageFn,
} from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  tag: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products } = useQuery({
    queryKey: ["products", "admin"],
    queryFn: () => getAllProducts(),
  });

  const { data: catList } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { images: [], inStock: true },
  });

  const images = watch("images") || [];

  const openCreate = () => {
    setEditingId(null);
    reset({ images: [], inStock: true });
    setSheetOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    reset({
      name: p.name,
      category: p.category,
      tag: p.tag || "",
      price: p.price,
      description: p.description || "",
      images: p.images || [],
      inStock: p.inStock ?? true,
    });
    setSheetOpen(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
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
    const current = images;
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file);
        current.push(url);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setValue("images", [...current]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    setValue("images", next);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (editingId) {
        await updateProduct({ data: { id: editingId, ...data } });
        toast.success("Product updated");
      } else {
        await createProduct({ data });
        toast.success("Product created");
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSheetOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? It will be soft-deleted.`)) return;
    try {
      await deleteProduct({ data: { id } });
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await createCategory({ data: { name: newCatName.trim() } });
      toast.success("Category created");
      setNewCatName("");
      setNewCatOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl">Products</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage your shop catalogue. Deleted items are soft-deleted.
          </p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openCreate} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>{editingId ? "Edit Product" : "Create Product"}</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} placeholder="Product name" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label>Category *</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {(catList || []).map((c: any) => (
                              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <Dialog open={newCatOpen} onOpenChange={setNewCatOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" type="button" size="icon" className="shrink-0 cursor-pointer">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div>
                          <Label htmlFor="new-cat">Category Name</Label>
                          <Input
                            id="new-cat"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="e.g. Textiles"
                          />
                        </div>
                        <Button onClick={handleCreateCategory} className="cursor-pointer">Create</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <Label htmlFor="tag">Tag</Label>
                <Input id="tag" {...register("tag")} placeholder="e.g. Limited Edition" />
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <Input id="price" {...register("price")} placeholder="e.g. KES 4,500" />
                {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} placeholder="Product description..." rows={3} />
              </div>

              <div>
                <Label>Images</Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
                  >
                    {uploading ? (
                      <span className="text-xs">Uploading...</span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-4 w-4" />
                        <span className="text-[0.6rem]">Add</span>
                      </div>
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="inStock">In Stock</Label>
                <Controller
                  name="inStock"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="inStock"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer">
                {editingId ? "Update Product" : "Create Product"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-8 border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!products || products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  No products yet.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p: any) => (
                <TableRow key={p.id} className={p.status === "DELETED" ? "opacity-50" : ""}>
                  <TableCell>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-muted" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.tag || "—"}</TableCell>
                  <TableCell>{p.price}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "DELETED" ? "destructive" : "secondary"} className="text-[0.65rem]">
                      {p.status === "DELETED" ? "Deleted" : p.inStock ? "Active" : "No stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status !== "DELETED" && (
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="cursor-pointer">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id, p.name)} className="cursor-pointer">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
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
