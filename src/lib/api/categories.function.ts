import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "../../db";
import { categories } from "../../db/schema";

export const getCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(categories).orderBy(categories.name);
  });

export const createCategory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  });
