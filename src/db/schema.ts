import { pgTable, text, timestamp, boolean, integer, serial } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  tag: text("tag"),
  price: text("price").notNull(),
  description: text("description"),
  images: text("images").array().default([]),
  inStock: boolean("in_stock").default(true),
  status: text("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  style: text("style").notNull(),
  level: text("level").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  capacity: integer("capacity").default(10),
  price: text("price"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exhibitions = pgTable("exhibitions", {
  id: serial("id").primaryKey(),
  tag: text("tag"),
  title: text("title").notNull(),
  description: text("description"),
  artistName: text("artist_name"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  room: text("room"),
  imageUrl: text("image_url"),
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  tag: text("tag"),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  imageUrl: text("image_url"),
  publishedAt: text("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").default("admin"),
  passwordHash: text("password_hash"),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classes.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  total: text("total").notNull(),
  status: text("status").default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  price: text("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});
