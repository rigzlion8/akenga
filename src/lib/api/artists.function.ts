import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, ne, and } from "drizzle-orm";
import { getDb } from "../../db";
import { artists } from "../../db/schema";

export const getArtists = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db
      .select()
      .from(artists)
      .where(and(ne(artists.status, "DELETED"), eq(artists.profileVisible, true)))
      .orderBy(artists.name);
  });

export const getAllArtists = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(artists).orderBy(artists.name);
  });

export const getArtistByPublicId = createServerFn({ method: "GET" })
  .inputValidator(z.object({ publicId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [artist] = await db
      .select()
      .from(artists)
      .where(eq(artists.publicId, data.publicId));
    if (!artist) throw new Error("Artist not found");
    return artist;
  });

const artistSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  nationality: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  profileVisible: z.boolean().optional(),
  userId: z.number().nullable().optional(),
});

export const createArtist = createServerFn({ method: "POST" })
  .inputValidator(artistSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const payload = { ...data, userId: data.userId || null, email: data.email || null };
    const [artist] = await db.insert(artists).values(payload as any).returning();
    return artist;
  });

export const updateArtist = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number(), ...artistSchema.shape }))
  .handler(async ({ data }) => {
    const { id, ...values } = data;
    const db = getDb();
    const [artist] = await db
      .update(artists)
      .set({ ...values, userId: values.userId || null, email: values.email || null } as any)
      .where(eq(artists.id, id))
      .returning();
    return artist;
  });

export const deleteArtist = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const db = getDb();
    await db.update(artists).set({ status: "DELETED" }).where(eq(artists.id, data.id));
  });

export const getArtistByUserId = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [artist] = await db.select().from(artists).where(eq(artists.userId, data.userId));
    return artist ?? null;
  });
