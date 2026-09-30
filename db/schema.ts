import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: text().notNull(),
  price: integer().notNull(),
  mrp: integer().notNull(),
  description: text().notNull().default(""),
  category: text().notNull(),
  imageUrl: text("image_url").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  tag: text().notNull().default("normal"),
  deliveryTime: text("delivery_time").notNull().default("15 mins"),
  size: text().notNull().default("normal"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
