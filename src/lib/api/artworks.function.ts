import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, ne, and } from "drizzle-orm";
import { getDb } from "../../db";
import { artworks, products } from "../../db/schema";

export const getArtworks = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db
      .select()
      .from(artworks)
      .where(ne(artworks.status, "DELETED"))
      .orderBy(artworks.createdAt);
  });

export const getArtworksByArtist = createServerFn({ method: "GET" })
  .inputValidator(z.object({ artistId: z.number() }))
  .handler(async ({ data }) => {
    const db = getDb();
    return db
      .select()
      .from(artworks)
      .where(and(eq(artworks.artistId, data.artistId), ne(artworks.status, "DELETED")))
      .orderBy(artworks.createdAt);
  });

export const getArtworkByPublicId = createServerFn({ method: "GET" })
  .inputValidator(z.object({ publicId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [artwork] = await db
      .select()
      .from(artworks)
      .where(eq(artworks.publicId, data.publicId));
    if (!artwork) throw new Error("Artwork not found");
    return artwork;
  });

export const getDailyArtworks = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    const daySeed = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const hash = Array.from(daySeed).reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const all = await db
      .select()
      .from(artworks)
      .where(and(ne(artworks.status, "DELETED"), eq(artworks.featured, true)));

    if (all.length > 0) {
      const shuffled = [...all].sort((a, b) => {
        const ha = (a.id * hash) % 97;
        const hb = (b.id * hash) % 97;
        return ha - hb;
      });
      return shuffled.slice(0, 8);
    }

    return db
      .select()
      .from(artworks)
      .where(ne(artworks.status, "DELETED"))
      .orderBy(artworks.createdAt)
      .limit(8);
  });

const artworkSchema = z.object({
  artistId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  year: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  isForSale: z.boolean().optional(),
  price: z.string().optional(),
  productId: z.number().nullable().optional(),
  featured: z.boolean().optional(),
});

async function syncProduct(db: ReturnType<typeof getDb>, artwork: any, productId: number | null) {
  if (artwork.isForSale && artwork.price) {
    const productData = {
      name: artwork.title,
      category: artwork.category || "Art",
      tag: artwork.tag || null,
      price: artwork.price,
      description: artwork.description || null,
      images: artwork.images || [],
      inStock: true,
    };

    if (productId) {
      // Update existing product
      await db.update(products).set(productData as any).where(eq(products.id, productId));
      return productId;
    } else {
      // Create new product
      const [product] = await db.insert(products).values(productData as any).returning();
      return product.id;
    }
  } else if (productId) {
    // Artwork no longer for sale — soft-delete the product
    await db.update(products).set({ status: "DELETED" }).where(eq(products.id, productId));
    return null;
  }
  return productId;
}

export const createArtwork = createServerFn({ method: "POST" })
  .inputValidator(artworkSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [artwork] = await db.insert(artworks).values(data as any).returning();

    // If for sale, create linked product
    if (artwork.isForSale && artwork.price) {
      const productData = {
        name: artwork.title,
        category: artwork.category || "Art",
        tag: artwork.tag || null,
        price: artwork.price,
        description: artwork.description || null,
        images: artwork.images || [],
        inStock: true,
      };
      const [product] = await db.insert(products).values(productData as any).returning();
      await db.update(artworks).set({ productId: product.id }).where(eq(artworks.id, artwork.id));
      artwork.productId = product.id;
    }

    return artwork;
  });

export const updateArtwork = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number(), ...artworkSchema.shape }))
  .handler(async ({ data }) => {
    const { id, ...values } = data;
    const db = getDb();

    // Get existing artwork to compare
    const [existing] = await db.select().from(artworks).where(eq(artworks.id, id));
    if (!existing) throw new Error("Artwork not found");

    const [artwork] = await db
      .update(artworks)
      .set(values as any)
      .where(eq(artworks.id, id))
      .returning();

    // Sync linked product
    const newProductId = await syncProduct(db, artwork, existing.productId);
    if (newProductId !== existing.productId) {
      await db.update(artworks).set({ productId: newProductId }).where(eq(artworks.id, id));
      artwork.productId = newProductId;
    }

    return artwork;
  });

export const deleteArtwork = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, data.id));

    // Soft-delete linked product
    if (artwork?.productId) {
      await db.update(products).set({ status: "DELETED" }).where(eq(products.id, artwork.productId));
    }

    await db.update(artworks).set({ status: "DELETED" }).where(eq(artworks.id, data.id));
  });

export const toggleFeatured = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number(), featured: z.boolean() }))
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .update(artworks)
      .set({ featured: data.featured })
      .where(eq(artworks.id, data.id));
  });
