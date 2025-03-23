import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model from existing schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  originalPrice: integer("original_price"), // in cents, for discounted items
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Product Details
export const productDetails = pgTable("product_details", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  light: text("light"),
  water: text("water"),
  height: text("height"),
  temperature: text("temperature"),
  careInstructions: text("care_instructions"),
});

export const insertProductDetailSchema = createInsertSchema(productDetails).omit({
  id: true,
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

// Gardener Bookings
export const gardenerBookings = pgTable("gardener_bookings", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull(),
  date: text("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  gardenSize: text("garden_size").notNull(),
  notes: text("notes"),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  rating: integer("rating"),
  reviewText: text("review_text"),
  createdAt: timestamp("created_at").defaultNow(),
  sessionId: text("session_id"),
});

export const insertGardenerBookingSchema = createInsertSchema(gardenerBookings).omit({
  id: true,
  createdAt: true,
});

// Cart
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  sessionId: text("session_id"),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

// Payment Methods
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  icon: text("icon").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  requiresCardDetails: boolean("requires_card_details").notNull().default(false),
  isDigitalWallet: boolean("is_digital_wallet").notNull().default(false),
  isCashOption: boolean("is_cash_option").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id"),
  sessionId: text("session_id"),
  status: text("status").notNull().default("pending"),
  subtotal: integer("subtotal").notNull(), // in cents
  tax: integer("tax").notNull(), // in cents
  shippingFee: integer("shipping_fee").notNull(), // in cents
  total: integer("total").notNull(), // in cents
  paymentMethodCode: text("payment_method_code").notNull(),
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // in cents, at the time of order
  name: text("name").notNull(), // product name at the time of order
  imageUrl: text("image_url").notNull(), // product image at the time of order
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductDetail = typeof productDetails.$inferSelect;
export type InsertProductDetail = z.infer<typeof insertProductDetailSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type GardenerBooking = typeof gardenerBookings.$inferSelect;
export type InsertGardenerBooking = z.infer<typeof insertGardenerBookingSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
