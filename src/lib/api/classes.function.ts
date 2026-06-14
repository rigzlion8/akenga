import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../../db";
import { classes } from "../../db/schema";

export const getClasses = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(classes).orderBy(classes.createdAt);
  });
