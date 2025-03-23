import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertGardenerBookingSchema, 
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import { randomUUID } from "crypto";
import Stripe from "stripe";

// Initialize Stripe with placeholder key - this will be replaced with real key later
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
// Using the latest API version that's compatible with our Stripe package
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2022-11-15",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = app.route("/api");

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const categorySlug = req.query.category as string | undefined;
      let products;

      console.log("Requested category slug:", categorySlug);
      
      if (categorySlug) {
        const category = await storage.getCategoryBySlug(categorySlug);
        console.log("Found category:", category);
        
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }
        
        products = await storage.getProductsByCategory(category.id);
        console.log(`Products for category '${categorySlug}':`, products);
      } else {
        products = await storage.getProducts();
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Get product details if available
      const productDetails = await storage.getProductDetailByProductId(product.id);

      res.json({
        ...product,
        details: productDetails || null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Gardener Booking
  app.get("/api/gardener-bookings", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      // For now, we'll return all bookings in the system
      // In a real app, we would filter by user ID or session ID
      const bookings = await storage.getGardenerBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gardener bookings" });
    }
  });

  app.post("/api/gardener-booking", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const bookingData = {
        ...req.body,
        sessionId
      };
      const validatedData = insertGardenerBookingSchema.parse(bookingData);
      const booking = await storage.createGardenerBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Update booking review
  app.put("/api/gardener-booking/:id/review", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }
      
      const { rating, reviewText } = req.body;
      
      // Validate rating is between 1-5
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      
      // Update the booking with the review data
      const updatedBooking = await storage.updateBookingReview(id, rating, reviewText);
      
      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking review:", error);
      res.status(500).json({ error: "Failed to update booking review" });
    }
  });

  // Cart Management
  // Helper to get or create session ID
  const getSessionId = (req: any): string => {
    if (!req.headers.session_id) {
      return randomUUID();
    }
    return req.headers.session_id as string;
  };

  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cartItems = await storage.getCartItemsBySessionId(sessionId);
      
      // Get product details for each cart item
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const products = await storage.getProducts();
          const product = products.find(p => p.id === item.productId);
          return {
            ...item,
            product
          };
        })
      );

      res.setHeader('session_id', sessionId);
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cartItemData = {
        ...req.body,
        sessionId
      };
      
      const validatedData = insertCartItemSchema.parse(cartItemData);
      const cartItem = await storage.createCartItem(validatedData);
      
      res.setHeader('session_id', sessionId);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItemQuantity(parseInt(id), quantity);
      
      if (!cartItem && quantity > 0) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.json(cartItem || { deleted: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCartItem(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });
  
  // Payment Methods
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });
  
  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      
      // Get cart items
      const cartItems = await storage.getCartItemsBySessionId(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      // Get products to calculate totals
      const products = await storage.getProducts();
      
      // Calculate order totals
      let subtotal = 0;
      cartItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          subtotal += product.price * item.quantity;
        }
      });
      
      // Apply tax and shipping fees
      const tax = Math.round(subtotal * 0.05); // 5% tax
      const shippingFee = subtotal >= 100000 ? 0 : 9900; // Free shipping over ₹1000
      const total = subtotal + tax + shippingFee;
      
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
      
      // Create order record
      const orderData = {
        ...req.body,
        orderNumber,
        sessionId,
        subtotal,
        tax,
        shippingFee,
        total,
        status: 'pending'
      };
      
      const validatedOrderData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedOrderData);
      
      // Create order items from cart items
      const orderItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = products.find(p => p.id === item.productId);
          const orderItemData = {
            orderId: order.id,
            productId: item.productId,
            name: product ? product.name : 'Unknown Product',
            price: product ? product.price : 0,
            quantity: item.quantity
          };
          
          const validatedOrderItemData = insertOrderItemSchema.parse(orderItemData);
          return storage.createOrderItem(validatedOrderItemData);
        })
      );
      
      // Clear the cart after successful order
      await storage.clearCart(sessionId);
      
      res.status(201).json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Order creation error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  
  app.get("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const orders = await storage.getOrdersBySessionId(sessionId);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItemsByOrderId(order.id);
          return {
            ...order,
            items
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  
  app.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const order = await storage.getOrderByOrderNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await storage.getOrderItemsByOrderId(order.id);
      
      res.json({
        ...order,
        items
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Stripe Payment Routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount provided" });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr", // Using INR for Indian Rupees
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Error creating payment intent",
        message: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
