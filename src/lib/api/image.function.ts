import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "../../db";
import { uploads } from "../../db/schema";
import { uploadImage } from "../storage";

export const uploadImageFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      base64: z.string().min(1),
      filename: z.string().min(1),
      alt: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const result = await uploadImage(data.base64, data.filename);

    const db = getDb();
    const [record] = await db
      .insert(uploads)
      .values({
        filename: result.filename,
        originalName: data.filename,
        mimeType: "image/*",
        size: Math.ceil(data.base64.length * 0.75),
        url: result.url,
        alt: data.alt,
      })
      .returning();

    return record;
  });
