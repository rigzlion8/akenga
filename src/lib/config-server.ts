import process from "node:process";

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    uploadBaseUrl: process.env.UPLOAD_BASE_URL || "/uploads",
    isVercel: !!process.env.VERCEL,
  };
}
