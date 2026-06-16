import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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

      {/* Hero image */}
      {hasImages && (
        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border mb-8">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {!hasImages && (
        <div className="aspect-[16/9] rounded-xl bg-muted border border-border mb-8 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No images</span>
        </div>
      )}

      {/* Thumbnail strip for multiple images */}
      {hasImages && product.images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 -mt-4">
          {product.images.map((url: string, i: number) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 border-border hover:border-accent transition-colors bg-muted"
            >
              <img
                src={url}
                alt={`${product.name} — image ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </a>
          ))}
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
