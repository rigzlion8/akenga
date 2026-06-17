import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { users, artists } from "../../db/schema";
import { hashPassword, verifyPassword, generateToken } from "../auth";
import { sendEmail, renderActivationEmail, renderResetEmail } from "../email";

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

    if (!found.activated) {
      throw new Error("Please activate your account first. Check your email for the activation link.");
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

export const register = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      name: z.string().min(1),
      password: z.string().min(6),
      role: z.enum(["user", "artist"]).optional().default("user"),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email));

    if (existing) throw new Error("An account with this email already exists");

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

    // If registering as artist, auto-create artist profile
    if (data.role === "artist") {
      await db.insert(artists).values({
        name: data.name,
        email: data.email,
        userId: user.id,
      });
    }

    const activationUrl = `${process.env.APP_URL || "http://localhost:3000"}/activate?token=${activationToken}`;

    await sendEmail(
      data.email,
      "Activate your Akenga Arts Centre account",
      renderActivationEmail(data.name, activationUrl),
    );

    return { user };
  });

export const activateAccount = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [found] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.activationToken, data.token));

    if (!found) throw new Error("Invalid or expired activation link");

    const sessionToken = generateToken();
    await db
      .update(users)
      .set({ activated: true, activationToken: null, sessionToken })
      .where(eq(users.id, found.id));

    return {
      user: { id: found.id, email: found.email, name: found.name },
      token: sessionToken,
    };
  });

export const forgotPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [user] = await db.select({ id: users.id, email: users.email, name: users.name, activated: users.activated }).from(users).where(eq(users.email, data.email));
    // Always return success to prevent email enumeration
    if (!user || !user.activated) return { ok: true };

    const resetToken = generateToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.update(users).set({ resetToken, resetTokenExpires: expires }).where(eq(users.id, user.id));

    const resetUrl = `${process.env.APP_URL || "https://akenga.vercel.app"}/reset-password?token=${resetToken}`;
    await sendEmail(user.email, "Reset your Akenga password", renderResetEmail(user.name, resetUrl));

    return { ok: true };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), password: z.string().min(6) }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [user] = await db.select({ id: users.id, name: users.name, resetTokenExpires: users.resetTokenExpires }).from(users).where(eq(users.resetToken, data.token));
    if (!user) throw new Error("Invalid or expired reset link");
    if (!user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) throw new Error("Reset link has expired");

    const passwordHash = await hashPassword(data.password);

    await db.update(users).set({ passwordHash, resetToken: null, resetTokenExpires: null }).where(eq(users.id, user.id));

    return { ok: true };
  });
