import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "../../db";
import { orders, orderItems, products } from "../../db/schema";
import { eq } from "drizzle-orm";

const orderItemSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  price: z.string(),
  quantity: z.number(),
});

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerLocation: z.string().optional(),
  total: z.string(),
  items: z.array(orderItemSchema),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator(orderSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    const { items, ...orderData } = data;

    for (const item of items) {
      const [product] = await db
        .select({ inStock: products.inStock, status: products.status })
        .from(products)
        .where(eq(products.id, item.productId));
      if (!product || !product.inStock || product.status === "DELETED") {
        throw new Error(`Product "${item.productName}" is no longer available.`);
      }
    }

    const [order] = await db.insert(orders).values(orderData).returning();

    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
      });
    }

    return order;
  });

export const getOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    const allOrders = await db.select().from(orders).orderBy(orders.createdAt);

    const ordersWithItems = await Promise.all(
      allOrders.map(async (o) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, o.id));
        return { ...o, items };
      }),
    );

    return ordersWithItems;
  });
