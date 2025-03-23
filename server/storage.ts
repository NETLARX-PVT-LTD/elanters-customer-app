import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  productDetails, type ProductDetail, type InsertProductDetail,
  services, type Service, type InsertService,
  gardenerBookings, type GardenerBooking, type InsertGardenerBooking,
  cartItems, type CartItem, type InsertCartItem,
  paymentMethods, type PaymentMethod, type InsertPaymentMethod,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Product Details
  getProductDetailByProductId(productId: number): Promise<ProductDetail | undefined>;
  createProductDetail(productDetail: InsertProductDetail): Promise<ProductDetail>;

  // Services
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;

  // Gardener Bookings
  getGardenerBookings(): Promise<GardenerBooking[]>;
  getGardenerBookingsBySessionId(sessionId: string): Promise<GardenerBooking[]>;
  createGardenerBooking(booking: InsertGardenerBooking): Promise<GardenerBooking>;
  updateBookingReview(id: number, rating: number, reviewText: string): Promise<GardenerBooking | undefined>;

  // Cart Items
  getCartItemsBySessionId(sessionId: string): Promise<CartItem[]>;
  getCartItemsByUserId(userId: number): Promise<CartItem[]>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Payment Methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethodByCode(code: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrdersBySessionId(sessionId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private productDetails: Map<number, ProductDetail>;
  private services: Map<number, Service>;
  private gardenerBookings: Map<number, GardenerBooking>;
  private cartItems: Map<number, CartItem>;
  private paymentMethods: Map<number, PaymentMethod>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;

  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentProductDetailId: number;
  private currentServiceId: number;
  private currentGardenerBookingId: number;
  private currentCartItemId: number;
  private currentPaymentMethodId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.productDetails = new Map();
    this.services = new Map();
    this.gardenerBookings = new Map();
    this.cartItems = new Map();
    this.paymentMethods = new Map();
    this.orders = new Map();
    this.orderItems = new Map();

    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentProductDetailId = 1;
    this.currentServiceId = 1;
    this.currentGardenerBookingId = 1;
    this.currentCartItemId = 1;
    this.currentPaymentMethodId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;

    // We need to initialize data asynchronously
    this.initializeData().then(() => {
      console.log("Data initialization complete");
      // Log all products to verify they were created
      console.log("Total products created:", this.products.size);
      Array.from(this.products.values()).forEach(product => {
        console.log(`Product: ${product.name}, Category ID: ${product.categoryId}`);
      });
    }).catch(err => {
      console.error("Failed to initialize data:", err);
    });
  }

  private async initializeData() {
    // Initialize payment methods
    const paymentMethodsData: InsertPaymentMethod[] = [
      { 
        name: "Credit / Debit Card", 
        code: "card",
        icon: "credit-card",
        requiresCardDetails: true,
        isDigitalWallet: false,
        isCashOption: false,
        sortOrder: 1,
        enabled: true
      },
      { 
        name: "Google Pay", 
        code: "googlepay",
        icon: "google",
        requiresCardDetails: false,
        isDigitalWallet: true,
        isCashOption: false,
        sortOrder: 2,
        enabled: true
      },
      { 
        name: "Apple Pay", 
        code: "applepay",
        icon: "apple",
        requiresCardDetails: false,
        isDigitalWallet: true,
        isCashOption: false,
        sortOrder: 3,
        enabled: true
      },
      { 
        name: "PayPal", 
        code: "paypal",
        icon: "paypal",
        requiresCardDetails: false,
        isDigitalWallet: true,
        isCashOption: false,
        sortOrder: 4,
        enabled: true
      },
      { 
        name: "Cash on Delivery", 
        code: "cod",
        icon: "cash",
        requiresCardDetails: false,
        isDigitalWallet: false,
        isCashOption: true,
        sortOrder: 5,
        enabled: true
      }
    ];
    
    // Create each payment method
    await Promise.all(
      paymentMethodsData.map(async (method) => await this.createPaymentMethod(method))
    );
  
    // Initialize categories
    const categoriesData: InsertCategory[] = [
      { name: "Plants", slug: "plants" },
      { name: "Pots", slug: "pots" },
      { name: "Soil", slug: "soil" },
      { name: "Accessories", slug: "accessories" }
    ];

    // Create each category and store the created categories
    const createdCategories = await Promise.all(
      categoriesData.map(async (category) => {
        const created = await this.createCategory(category);
        return created;
      })
    );

    // Log created categories
    console.log("Created categories:", createdCategories);

    // Initialize services
    const servicesData: InsertService[] = [
      { name: "Indoor Plant Care", description: "Expert care for your indoor plants and arrangements", icon: "leaf" },
      { name: "Garden Design", description: "Professional landscape and garden design services", icon: "pencil-ruler" },
      { name: "Plant Health", description: "Diagnosis and treatment for plant diseases and pests", icon: "heartbeat" },
      { name: "Seasonal Planting", description: "Seasonal planting and garden refresh services", icon: "calendar" }
    ];

    // Create each service
    await Promise.all(
      servicesData.map(async (service) => await this.createService(service))
    );

    // Get categories after they've been created
    const plantsCategory = createdCategories[0];
    const potsCategory = createdCategories[1];
    const soilCategory = createdCategories[2];
    const accessoriesCategory = createdCategories[3];

    console.log("Plants category:", plantsCategory);
    console.log("Pots category:", potsCategory);
    console.log("Soil category:", soilCategory);
    console.log("Accessories category:", accessoriesCategory);

    if (plantsCategory && potsCategory && soilCategory && accessoriesCategory) {
      // Plants
      const plantsData: InsertProduct[] = [
        {
          name: "Monstera Deliciosa Plant",
          slug: "monstera-deliciosa",
          description: "The Monstera Deliciosa, also known as the Swiss Cheese Plant, is famous for its quirky natural leaf holes.",
          price: 49900, // ₹499
          originalPrice: 69900, // ₹699
          imageUrl: "https://images.unsplash.com/photo-1614594895304-fe7116ac3b73?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          categoryId: plantsCategory.id,
          inStock: true,
          featured: true,
          rating: 4.0,
          reviewCount: 24
        },
        {
          name: "Snake Plant",
          slug: "snake-plant",
          description: "The Snake Plant is one of the most low-maintenance plants you can grow, making it perfect for beginners.",
          price: 34900, // ₹349
          imageUrl: "https://images.unsplash.com/photo-1598880513596-cf08398a71d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          categoryId: plantsCategory.id,
          inStock: true,
          featured: true,
          rating: 4.5,
          reviewCount: 42
        },
        {
          name: "Peace Lily",
          slug: "peace-lily",
          description: "The Peace Lily is an easy-care plant that brings elegance and tranquility to any indoor space.",
          price: 59900, // ₹599
          imageUrl: "https://images.unsplash.com/photo-1632822118334-6896c2e7364f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          categoryId: plantsCategory.id,
          inStock: true,
          featured: true,
          rating: 4.0,
          reviewCount: 18
        },
        {
          name: "Money Plant",
          slug: "money-plant",
          description: "The Money Plant is believed to bring good luck and prosperity, and it's also very easy to grow.",
          price: 29900, // ₹299
          imageUrl: "https://images.unsplash.com/photo-1603436326446-74e69e9f54af?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          categoryId: plantsCategory.id,
          inStock: true,
          featured: true,
          rating: 3.5,
          reviewCount: 31
        }
      ];

      // Create plants
      await Promise.all(plantsData.map(async (product) => {
        const createdProduct = await this.createProduct(product);
        console.log(`Created plant product: ${createdProduct.name}, ID: ${createdProduct.id}, CategoryID: ${createdProduct.categoryId}`);
        
        if (product.name === "Monstera Deliciosa Plant") {
          await this.createProductDetail({
            productId: createdProduct.id,
            light: "Bright Indirect",
            water: "Once a week",
            height: "30-40 cm",
            temperature: "18-30°C",
            careInstructions: "Keep soil moist but not soggy\nPlace in bright, indirect sunlight\nWipe leaves occasionally to remove dust\nRepot every 2-3 years in spring"
          });
        }
        return createdProduct;
      }));

      // Accessories
      const accessoriesData: InsertProduct[] = [
        {
          name: "Ceramic Pot",
          slug: "ceramic-pot",
          description: "A beautiful ceramic pot for your favorite plants.",
          price: 59900, // ₹599
          imageUrl: "https://images.unsplash.com/photo-1562517634-baa2da3acfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          categoryId: potsCategory.id,
          inStock: true,
          rating: 4.2,
          reviewCount: 15
        },
        {
          name: "Gardening Gloves",
          slug: "gardening-gloves",
          description: "Durable gardening gloves to protect your hands while working in the garden.",
          price: 24900, // ₹249
          imageUrl: "https://images.unsplash.com/photo-1559070657-e4f688d76e8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          categoryId: accessoriesCategory.id,
          inStock: true,
          rating: 4.0,
          reviewCount: 23
        },
        {
          name: "Watering Can",
          slug: "watering-can",
          description: "A stylish watering can for all your plant watering needs.",
          price: 39900, // ₹399
          imageUrl: "https://images.unsplash.com/photo-1588621697430-44e66a13a29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          categoryId: accessoriesCategory.id,
          inStock: true,
          rating: 4.1,
          reviewCount: 19
        },
        {
          name: "Garden Shovel",
          slug: "garden-shovel",
          description: "A high-quality garden shovel for your planting needs.",
          price: 34900, // ₹349
          imageUrl: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          categoryId: accessoriesCategory.id,
          inStock: true,
          rating: 3.9,
          reviewCount: 27
        }
      ];

      // Create accessories products
      await Promise.all(accessoriesData.map(async (product) => {
        const createdProduct = await this.createProduct(product);
        console.log(`Created accessory product: ${createdProduct.name}, ID: ${createdProduct.id}, CategoryID: ${createdProduct.categoryId}`);
        return createdProduct;
      }));

      // Soil & Manure
      const soilData: InsertProduct[] = [
        {
          name: "Organic Potting Soil",
          slug: "organic-potting-soil",
          description: "High-quality organic potting soil for healthy plant growth.",
          price: 29900, // ₹299
          imageUrl: "https://images.unsplash.com/photo-1467205077495-1712e4be58d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          categoryId: soilCategory.id,
          inStock: true,
          rating: 4.3,
          reviewCount: 32
        },
        {
          name: "Vermicompost",
          slug: "vermicompost",
          description: "Nutrient-rich organic compost produced by earthworms for your plants.",
          price: 19900, // ₹199
          imageUrl: "https://images.unsplash.com/photo-1581281698667-7524cd5b2ba2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          categoryId: soilCategory.id,
          inStock: true,
          rating: 4.6,
          reviewCount: 44
        },
        {
          name: "Coco Peat",
          slug: "coco-peat",
          description: "Eco-friendly growing medium made from coconut husk.",
          price: 14900, // ₹149
          imageUrl: "https://images.unsplash.com/photo-1635526909130-f0b76e90f7dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          categoryId: soilCategory.id,
          inStock: true,
          rating: 4.2,
          reviewCount: 36
        },
        {
          name: "Perlite Mix",
          slug: "perlite-mix",
          description: "Lightweight soil amendment for improved drainage and aeration.",
          price: 24900, // ₹249
          imageUrl: "https://images.unsplash.com/photo-1605159723089-96db12163e1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          categoryId: soilCategory.id,
          inStock: true,
          rating: 4.0,
          reviewCount: 28
        }
      ];

      // Create soil products
      await Promise.all(soilData.map(async (product) => {
        const createdProduct = await this.createProduct(product);
        console.log(`Created soil product: ${createdProduct.name}, ID: ${createdProduct.id}, CategoryID: ${createdProduct.categoryId}`);
        return createdProduct;
      }));
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.slug === slug);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.featured);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Product Details methods
  async getProductDetailByProductId(productId: number): Promise<ProductDetail | undefined> {
    return Array.from(this.productDetails.values()).find(detail => detail.productId === productId);
  }

  async createProductDetail(productDetail: InsertProductDetail): Promise<ProductDetail> {
    const id = this.currentProductDetailId++;
    const newProductDetail: ProductDetail = { ...productDetail, id };
    this.productDetails.set(id, newProductDetail);
    return newProductDetail;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }

  // Gardener Booking methods
  async getGardenerBookings(): Promise<GardenerBooking[]> {
    return Array.from(this.gardenerBookings.values());
  }

  async getGardenerBookingsBySessionId(sessionId: string): Promise<GardenerBooking[]> {
    return Array.from(this.gardenerBookings.values())
      .filter(booking => booking.sessionId === sessionId);
  }

  async createGardenerBooking(booking: InsertGardenerBooking): Promise<GardenerBooking> {
    const id = this.currentGardenerBookingId++;
    const newBooking: GardenerBooking = {
      ...booking,
      id,
      createdAt: new Date(),
      rating: null,
      reviewText: null
    };
    this.gardenerBookings.set(id, newBooking);
    
    // Add some sample bookings for demonstration purposes
    if (this.gardenerBookings.size === 1) {
      // Create one past booking
      const pastBookingId = this.currentGardenerBookingId++;
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 15); // 15 days ago
      
      const pastBooking: GardenerBooking = {
        id: pastBookingId,
        serviceType: "maintenance",
        date: pastDate.toISOString().split('T')[0],
        timeSlot: "Morning (9AM-12PM)",
        gardenSize: "Medium (100-500 sq ft)",
        notes: "Trimmed the hedges and removed weeds",
        contactName: "John Doe",
        contactPhone: "9876543210",
        contactEmail: "john@example.com",
        createdAt: new Date(pastDate),
        sessionId: booking.sessionId,
        rating: 4,
        reviewText: "Great service! The gardener was very knowledgeable and helpful."
      };
      this.gardenerBookings.set(pastBookingId, pastBooking);
      
      // Create one upcoming booking
      const upcomingBookingId = this.currentGardenerBookingId++;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5); // 5 days in future
      
      const upcomingBooking: GardenerBooking = {
        id: upcomingBookingId,
        serviceType: "planting",
        date: futureDate.toISOString().split('T')[0],
        timeSlot: "Afternoon (1PM-4PM)",
        gardenSize: "Small (< 100 sq ft)",
        notes: "Need help with planting new flowers in the garden",
        contactName: "John Doe",
        contactPhone: "9876543210",
        contactEmail: "john@example.com",
        createdAt: new Date(),
        sessionId: booking.sessionId,
        rating: null,
        reviewText: null
      };
      this.gardenerBookings.set(upcomingBookingId, upcomingBooking);
    }
    
    return newBooking;
  }
  
  async updateBookingReview(id: number, rating: number, reviewText: string): Promise<GardenerBooking | undefined> {
    const booking = this.gardenerBookings.get(id);
    
    if (!booking) {
      return undefined;
    }
    
    // Update the booking with the review data
    const updatedBooking: GardenerBooking = {
      ...booking,
      rating,
      reviewText
    };
    
    // Save the updated booking
    this.gardenerBookings.set(id, updatedBooking);
    
    return updatedBooking;
  }

  // Cart methods
  async getCartItemsBySessionId(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async getCartItemsByUserId(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if product already exists in cart
    const existingCartItem = Array.from(this.cartItems.values()).find(
      item => 
        (item.sessionId === cartItem.sessionId || item.userId === cartItem.userId) && 
        item.productId === cartItem.productId
    );

    if (existingCartItem) {
      return this.updateCartItemQuantity(existingCartItem.id, existingCartItem.quantity + (cartItem.quantity || 1));
    }

    const id = this.currentCartItemId++;
    const newCartItem: CartItem = {
      ...cartItem,
      id,
      createdAt: new Date()
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }

    const updatedCartItem: CartItem = {
      ...cartItem,
      quantity
    };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const cartItemIds = Array.from(this.cartItems.values())
      .filter(item => item.sessionId === sessionId)
      .map(item => item.id);
    
    cartItemIds.forEach(id => this.cartItems.delete(id));
    return true;
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values());
  }
  
  async getPaymentMethodByCode(code: string): Promise<PaymentMethod | undefined> {
    return Array.from(this.paymentMethods.values()).find(method => method.code === code);
  }
  
  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.currentPaymentMethodId++;
    const newPaymentMethod: PaymentMethod = { ...paymentMethod, id };
    this.paymentMethods.set(id, newPaymentMethod);
    return newPaymentMethod;
  }
  
  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => order.orderNumber === orderNumber);
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
  
  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.sessionId === sessionId);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const now = new Date();
    const newOrder: Order = { 
      ...order, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: new Date()
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Items
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
}

export const storage = new MemStorage();
