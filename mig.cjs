const fs = require("fs");
const { Pool } = require("pg");

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/^DATABASE_URL=(.+)$/m);
const url = match ? match[1].trim() : null;
if (!url) { console.log("No URL"); process.exit(1); }

async function main() {
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20000 });
  const client = await pool.connect();
  try {
    const cols = ["nationality", "instagram", "tiktok", "twitter"];
    for (const col of cols) {
      try {
        await client.query("ALTER TABLE artists ADD COLUMN IF NOT EXISTS " + col + " text");
        console.log("OK:", col);
      } catch (e) {
        if (e.message && e.message.includes("already exists")) console.log("SKIP:", col);
        else console.log("ERR:", col, e.message ? e.message.substring(0, 100) : e);
      }
    }
    console.log("Done!");
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(function(e) { console.error(e.message); process.exit(1); });
