import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, ne, and } from "drizzle-orm";
import { getDb } from "../../db";
import { exhibitions } from "../../db/schema";

export const getExhibitions = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(exhibitions).where(ne(exhibitions.status, "DELETED")).orderBy(exhibitions.startDate);
  });

export const getExhibitionsByArtist = createServerFn({ method: "GET" })
  .inputValidator(z.object({ artistId: z.number() }))
  .handler(async ({ data }) => {
    const db = getDb();
    return db.select().from(exhibitions).where(and(eq(exhibitions.artistId, data.artistId), ne(exhibitions.status, "DELETED"))).orderBy(exhibitions.startDate);
  });

export const getExhibitionByPublicId = createServerFn({ method: "GET" })
  .inputValidator(z.object({ publicId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [e] = await db.select().from(exhibitions).where(eq(exhibitions.publicId, data.publicId));
    if (!e) throw new Error("Exhibition not found");
    return e;
  });

export const getLiveExhibitions = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(exhibitions).where(and(eq(exhibitions.isLive, true), ne(exhibitions.status, "DELETED"))).orderBy(exhibitions.startDate);
  });

const schema = z.object({
  title: z.string().min(1), description: z.string().optional(), artistId: z.number().nullable().optional(),
  artistName: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(),
  location: z.string().optional(), venue: z.string().optional(), room: z.string().optional(),
  ticketType: z.enum(["FREE", "PAID", "BUNDLE"]).optional(), ticketPrice: z.string().optional(),
  ticketUrl: z.string().optional(), guestAppearances: z.string().optional(),
  tag: z.string().optional(), imageUrl: z.string().optional(), images: z.array(z.string()).optional(),
  isLive: z.boolean().optional(), featured: z.boolean().optional(),
});

export const createExhibition = createServerFn({ method: "POST" }).inputValidator(schema)
  .handler(async ({ data }) => { const db = getDb(); const [e] = await db.insert(exhibitions).values(data as any).returning(); return e; });

export const updateExhibition = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number(), ...schema.shape }))
  .handler(async ({ data }) => { const { id, ...v } = data; const db = getDb(); const [e] = await db.update(exhibitions).set(v as any).where(eq(exhibitions.id, id)).returning(); return e; });

export const deleteExhibition = createServerFn({ method: "POST" }).inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => { const db = getDb(); await db.update(exhibitions).set({ status: "DELETED" }).where(eq(exhibitions.id, data.id)); });
