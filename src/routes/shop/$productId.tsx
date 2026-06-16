import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getProductById } from "@/lib/api";
import { useCart } from "@/hooks/cart";

export const Route = createFileRoute("/shop/$productId")({
  head: () => ({
    meta: [
      { title: "Product — Akenga Boutique" },
      { name: "description", content: "View product details from Akenga Arts Centre's curated boutique." },
      { property: "og:type", content: "product" },
    ],
  }),
  component: ShopProductDetail,
});

function ShopProductDetail() {
  const { productId } = useParams({ from: "/shop/$productId" });
  const id = Number(productId);
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById({ data: { id } }),
    enabled: !isNaN(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Link
          to="/shop"
          className="text-xs tracking-[0.2em] uppercase text-accent hover:text-foreground transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [];

  const nextImage = () => {
    if (images.length > 0) {
      setActiveImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: images[0],
    });
    toast.success(`Added "${product.name}" to cart`);
  };

  return (
    <>
      <section className="pt-36 pb-8 max-w-7xl mx-auto px-6 lg:px-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Shop
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden bg-muted rounded-xl border border-border">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeImage]}
                    alt={`${product.name} — image ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
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
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  No image available
                </div>
              )}
              {product.tag && (
                <span className="absolute top-4 left-4 bg-foreground/90 text-background text-[0.65rem] tracking-[0.2em] uppercase px-3 py-1.5">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                      i === activeImage
                        ? "border-accent"
                        : "border-transparent hover:border-border"
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

          {/* Product info */}
          <div className="flex flex-col justify-center">
            <p className="eyebrow">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-5xl mt-3">{product.name}</h1>

            <div className="h-px w-24 bg-accent/50 my-6" />

            <p className="font-serif text-2xl md:text-3xl text-foreground">
              {product.price}
            </p>

            {product.description && (
              <div className="mt-6">
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
                  About this piece
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-foreground/80 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              {/* Stock info */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    product.status === "DELETED" || !product.inStock
                      ? "bg-destructive"
                      : "bg-emerald-500"
                  }`}
                />
                <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                  {product.status === "DELETED"
                    ? "Unavailable"
                    : product.stock != null
                      ? `In Stock — ${product.stock} available`
                      : product.inStock
                        ? "In Stock"
                        : "Out of Stock"}
                </span>
              </div>

              {product.status !== "DELETED" && product.inStock !== false && (
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Add to Cart
                </button>
              )}
            </div>

            {/* Extra metadata */}
            <div className="mt-10 border-t border-border/60 pt-6">
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground tracking-[0.15em] uppercase mb-1">
                    Category
                  </dt>
                  <dd>{product.category}</dd>
                </div>
                {product.tag && (
                  <div>
                    <dt className="text-muted-foreground tracking-[0.15em] uppercase mb-1">
                      Tag
                    </dt>
                    <dd>{product.tag}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
