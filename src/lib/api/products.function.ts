import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "../../db";
import { products } from "../../db/schema";
import { eq, ne } from "drizzle-orm";

export const getProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db
      .select()
      .from(products)
      .where(ne(products.status, "DELETED"))
      .orderBy(products.createdAt);
  });

export const getAllProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(products).orderBy(products.createdAt);
  });

const productSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  tag: z.string().optional(),
  price: z.string().min(1),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
});

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator(productSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [product] = await db.insert(products).values(data).returning();
    return product;
  });

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number(), ...productSchema.shape }))
  .handler(async ({ data }) => {
    const { id, ...values } = data;
    const db = getDb();
    const [product] = await db
      .update(products)
      .set(values)
      .where(eq(products.id, id))
      .returning();
    return product;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .update(products)
      .set({ status: "DELETED" })
      .where(eq(products.id, data.id));
  });
