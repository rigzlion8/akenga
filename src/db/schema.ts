import { pgTable, text, timestamp, boolean, integer, serial, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").defaultRandom().notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  tag: text("tag"),
  price: text("price").notNull(),
  description: text("description"),
  images: text("images").array().default([]),
  inStock: boolean("in_stock").default(true),
  stock: integer("stock"),
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
  publicId: uuid("public_id").defaultRandom().notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  artistId: integer("artist_id").references(() => artists.id),
  artistName: text("artist_name"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  location: text("location"),
  venue: text("venue"),
  room: text("room"),
  ticketType: text("ticket_type").default("FREE"),
  ticketPrice: text("ticket_price"),
  ticketUrl: text("ticket_url"),
  guestAppearances: text("guest_appearances"),
  tag: text("tag"),
  imageUrl: text("image_url"),
  images: text("images").array().default([]),
  isLive: boolean("is_live").default(false),
  featured: boolean("featured").default(false),
  status: text("status").default("ACTIVE"),
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
  activationToken: text("activation_token"),
  activated: boolean("activated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").defaultRandom().notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  nationality: text("nationality"),
  website: text("website"),
  email: text("email"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  twitter: text("twitter"),
  userId: integer("user_id").references(() => users.id),
  status: text("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").defaultRandom().notNull().unique(),
  artistId: integer("artist_id").notNull().references(() => artists.id),
  title: text("title").notNull(),
  description: text("description"),
  medium: text("medium"),
  dimensions: text("dimensions"),
  year: text("year"),
  images: text("images").array().default([]),
  category: text("category"),
  tag: text("tag"),
  isForSale: boolean("is_for_sale").default(false),
  price: text("price"),
  productId: integer("product_id").references(() => products.id),
  featured: boolean("featured").default(false),
  status: text("status").default("ACTIVE"),
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
  customerLocation: text("customer_location"),
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
