import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, ne, sql } from "drizzle-orm";
import { getDb } from "../../db";
import { artworks } from "../../db/schema";

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
      .where(eq(artworks.artistId, data.artistId))
      .where(ne(artworks.status, "DELETED"))
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
    // Seed-based daily rotation: use current date as seed for deterministic "random"
    const daySeed = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const hash = Array.from(daySeed).reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const all = await db
      .select()
      .from(artworks)
      .where(ne(artworks.status, "DELETED"))
      .where(eq(artworks.featured, true));

    // If we have featured artworks, return those; otherwise fall back to recent
    if (all.length > 0) {
      // Deterministic shuffle based on day seed
      const shuffled = [...all].sort((a, b) => {
        const ha = (a.id * hash) % 97;
        const hb = (b.id * hash) % 97;
        return ha - hb;
      });
      return shuffled.slice(0, 8);
    }

    // Fallback: recent artworks
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

export const createArtwork = createServerFn({ method: "POST" })
  .inputValidator(artworkSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [artwork] = await db.insert(artworks).values(data as any).returning();
    return artwork;
  });

export const updateArtwork = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number(), ...artworkSchema.shape }))
  .handler(async ({ data }) => {
    const { id, ...values } = data;
    const db = getDb();
    const [artwork] = await db
      .update(artworks)
      .set(values as any)
      .where(eq(artworks.id, id))
      .returning();
    return artwork;
  });

export const deleteArtwork = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const db = getDb();
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
