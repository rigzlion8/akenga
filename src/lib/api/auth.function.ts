import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { users } from "../../db/schema";
import { verifyPassword, generateToken } from "../auth";

const userSelect = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  createdAt: users.createdAt,
};

type SafeUser = typeof userSelect;

export const login = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb();
    const [found] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (!found || !found.passwordHash) {
      throw new Error("Invalid email or password");
    }

    if (!verifyPassword(data.password, found.passwordHash)) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken();
    await db
      .update(users)
      .set({ sessionToken: token })
      .where(eq(users.id, found.id));

    return {
      user: {
        id: found.id,
        email: found.email,
        name: found.name,
        role: found.role,
        createdAt: found.createdAt,
      },
      token,
    };
  });

export const getCurrentUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ token: z.string().min(1) }),
  )
  .handler(async ({ data }) => {
    const db = getDb();
    const [found] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.sessionToken, data.token));

    return found ?? null;
  });

export const logout = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ token: z.string().min(1) }),
  )
  .handler(async ({ data }) => {
    const db = getDb();
    const [found] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.sessionToken, data.token));

    if (found) {
      await db
        .update(users)
        .set({ sessionToken: null })
        .where(eq(users.id, found.id));
    }
  });
