import { getDb } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth";

async function seed() {
  const db = getDb();

  const email = process.env.ADMIN_EMAIL || "admin@akenga.art";
  const password = process.env.ADMIN_PASSWORD || "changeme123";
  const name = process.env.ADMIN_NAME || "Admin";

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    console.log(`Admin user "${email}" already exists. Skipping.`);
    process.exit(0);
  }

  await db.insert(users).values({
    email,
    name,
    role: "admin",
    passwordHash: hashPassword(password),
  });

  console.log(`Created admin user: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`\nRun with env vars to customize:`);
  console.log(`  ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... bun run db:seed`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
