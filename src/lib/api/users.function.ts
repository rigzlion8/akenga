import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { users } from "../../db/schema";
import { hashPassword, generateToken } from "../auth";
import { sendEmail, renderActivationEmail } from "../email";

const ADMIN_ROLES = ["admin", "operations", "finance"];

async function validateAdmin(token: string) {
  const db = getDb();
  const [found] = await db
    .select()
    .from(users)
    .where(eq(users.sessionToken, token));

  if (!found) throw new Error("Unauthorized");
  if (!ADMIN_ROLES.includes(found.role || "")) throw new Error("Forbidden");
  return found;
}

export const getUsers = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ token: z.string().min(1) }),
  )
  .handler(async ({ data }) => {
    await validateAdmin(data.token);
    const db = getDb();
    const all = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);
    return all;
  });

export const createUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      email: z.string().email(),
      name: z.string().min(1),
      password: z.string().min(6),
      role: z.enum(["admin", "editor", "customer", "user", "guest", "premium", "operations", "finance"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await validateAdmin(data.token);
    const db = getDb();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email));

    if (existing) throw new Error("A user with this email already exists");

    const activationToken = generateToken();

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        role: data.role || "user",
        passwordHash: hashPassword(data.password),
        activationToken,
        activated: false,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      });

    const activationUrl = `${process.env.APP_URL || "http://localhost:3000"}/activate?token=${activationToken}`;

    await sendEmail(
      data.email,
      "Activate your Akenga Arts Centre account",
      renderActivationEmail(data.name, activationUrl),
    );

    return user;
  });

export const updateUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      id: z.number(),
      email: z.string().email().optional(),
      name: z.string().min(1).optional(),
      role: z.enum(["admin", "editor", "customer", "user", "guest", "premium", "operations", "finance"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await validateAdmin(data.token);
    const db = getDb();

    const [updated] = await db
      .update(users)
      .set({
        ...(data.email !== undefined && { email: data.email }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role }),
      })
      .where(eq(users.id, data.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      });

    return updated;
  });

export const deleteUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      id: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await validateAdmin(data.token);

    if (admin.id === data.id) {
      throw new Error("Cannot delete your own account");
    }

    const db = getDb();
    await db.delete(users).where(eq(users.id, data.id));
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      id: z.number(),
      password: z.string().min(6),
    }),
  )
  .handler(async ({ data }) => {
    await validateAdmin(data.token);
    const db = getDb();
    await db
      .update(users)
      .set({
        passwordHash: hashPassword(data.password),
        sessionToken: null,
      })
      .where(eq(users.id, data.id));
  });
