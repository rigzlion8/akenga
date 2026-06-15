import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "../../db";
import { classes, enrollments } from "../../db/schema";
import { eq } from "drizzle-orm";

export const getClasses = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(classes).orderBy(classes.createdAt);
  });

const classSchema = z.object({
  name: z.string().min(1),
  style: z.string().min(1),
  level: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  capacity: z.number().optional(),
  price: z.string().optional(),
});

export const createClass = createServerFn({ method: "POST" })
  .inputValidator(classSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [cls] = await db.insert(classes).values(data).returning();
    return cls;
  });

export const updateClass = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number(), ...classSchema.shape }))
  .handler(async ({ data }) => {
    const { id, ...values } = data;
    const db = getDb();
    const [cls] = await db
      .update(classes)
      .set(values)
      .where(eq(classes.id, id))
      .returning();
    return cls;
  });

export const deleteClass = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const db = getDb();
    await db.delete(classes).where(eq(classes.id, data.id));
  });

const enrollmentSchema = z.object({
  classId: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const submitEnrollment = createServerFn({ method: "POST" })
  .inputValidator(enrollmentSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const [enrollment] = await db.insert(enrollments).values(data).returning();
    return enrollment;
  });

export const getEnrollments = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(enrollments).orderBy(enrollments.createdAt);
  });
