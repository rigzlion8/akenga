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

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Products
        </Link>
      </div>

      <div className={`${isDeleted ? "opacity-50" : ""}`}>
        {/* Images */}
        {product.images && product.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {product.images.map((url: string, i: number) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border"
              >
                <img
                  src={url}
                  alt={`${product.name} — image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Hero image fallback */}
        {(!product.images || product.images.length === 0) && (
          <div className="w-full aspect-[3/1] rounded-xl bg-muted border border-border mb-8 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No images</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="eyebrow">{product.category}</p>
              <h1 className="font-serif text-3xl md:text-4xl mt-2">{product.name}</h1>
              {product.tag && (
                <Badge variant="secondary" className="mt-2 text-[0.65rem]">
                  {product.tag}
                </Badge>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border p-6 space-y-5">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-1">
                  Price
                </p>
                <p className="font-serif text-2xl">{product.price}</p>
              </div>

              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-1">
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

              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-1">
                  Stock
                </p>
                <p className="text-sm">
                  {product.stock != null ? `${product.stock} units` : "Unlimited"}
                </p>
              </div>

              {!isDeleted && (
                <Link
                  to="/admin/products"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={(e) => {
                    // The edit flow already exists on the list page
                    // We can't easily trigger the sheet from here,
                    // but navigating back is the simplest.
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Product
                </Link>
              )}
            </div>

            <div className="rounded-xl border border-border p-6">
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                Metadata
              </p>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ID</dt>
                  <dd>{product.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd>{product.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd>
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
    </>
  );
}
