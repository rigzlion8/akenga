import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProductById } from "@/lib/api";

export const Route = createFileRoute("/admin/products/$productId")({
  head: () => ({
    meta: [{ title: "Product Detail — Admin — Akenga Arts Centre" }],
  }),
  component: AdminProductDetail,
});

function AdminProductDetail() {
  const { productId } = useParams({ from: "/admin/products/$productId" });
  const id = Number(productId);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById({ data: { id } }),
    enabled: !isNaN(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Link
          to="/admin/products"
          className="text-xs tracking-[0.2em] uppercase text-accent hover:text-foreground transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const isDeleted = product.status === "DELETED";
  const hasImages = product.images && product.images.length > 0;
  const images: string[] = (product.images as string[]) ?? [];
  const hasMultiple = images.length > 1;

  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb */}
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Products
      </Link>

      {/* Hero image with carousel */}
      {hasImages && (
        <div className="space-y-3 mb-8">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border">
            <img
              src={images[activeImage]}
              alt={`${product.name} — image ${activeImage + 1}`}
              className="w-full h-full object-cover"
            />
            {hasMultiple && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                {/* Dot indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                        i === activeImage ? "bg-white" : "bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {hasMultiple && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer bg-muted ${
                    i === activeImage
                      ? "border-accent"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <img
                    src={url}
                    alt={`${product.name} — thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasImages && (
        <div className="aspect-[16/9] rounded-xl bg-muted border border-border mb-8 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No images</span>
        </div>
      )}

      {/* Main content: two columns */}
      <div className={`grid lg:grid-cols-[1fr_300px] gap-8 ${isDeleted ? "opacity-50" : ""}`}>
        {/* Left: product info */}
        <div className="space-y-6">
          <div>
            <p className="eyebrow">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl mt-2">{product.name}</h1>
            {product.tag && (
              <Badge variant="secondary" className="mt-3 text-[0.65rem]">
                {product.tag}
              </Badge>
            )}
          </div>

          {product.description && (
            <div>
              <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {!product.description && (
            <p className="text-sm text-muted-foreground italic">No description provided.</p>
          )}
        </div>

        {/* Right: info panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-5 space-y-4">
            <div>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                Price
              </p>
              <p className="font-serif text-2xl">{product.price}</p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Status
              </p>
              <Badge
                variant={isDeleted ? "destructive" : "secondary"}
                className="text-[0.65rem]"
              >
                {isDeleted
                  ? "Deleted"
                  : product.stock != null
                    ? `In Stock: ${product.stock}`
                    : product.inStock
                      ? "Active"
                      : "No stock"}
              </Badge>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                Stock
              </p>
              <p className="text-sm">
                {product.stock != null ? `${product.stock} units` : "Unlimited"}
              </p>
            </div>

            {!isDeleted && (
              <Link
                to="/admin/products"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Product
              </Link>
            )}
          </div>

          <div className="rounded-xl border border-border p-5">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Metadata
            </p>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-medium">{product.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{product.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
