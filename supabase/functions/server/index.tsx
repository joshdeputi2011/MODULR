import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { registerUser, loginUser, verifyToken, getUserFromToken } from "./auth.tsx";
import { generateOutfits, ClothingItem } from "./outfit-generator.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-644ccd78/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ENDPOINTS ====================

/**
 * POST /auth/register
 * Register a new user
 */
app.post("/make-server-644ccd78/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    const result = await registerUser(email, password, name);

    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Registration failed: " + error.message }, 500);
  }
});

/**
 * POST /auth/login
 * Login existing user
 */
app.post("/make-server-644ccd78/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    const result = await loginUser(email, password);

    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed: " + error.message }, 500);
  }
});

/**
 * GET /auth/me
 * Get current user info from token
 */
app.get("/make-server-644ccd78/auth/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    // Don't send password hash
    const { passwordHash, ...userData } = user;

    return c.json({ success: true, data: userData });
  } catch (error) {
    console.error("Auth verification error:", error);
    return c.json({ error: "Authentication failed: " + error.message }, 500);
  }
});

// ==================== WARDROBE ENDPOINTS ====================

/**
 * Middleware: Authenticate user
 */
async function authenticateUser(c: any, next: () => Promise<void>) {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return c.json({ error: "Unauthorized - No token provided" }, 401);
  }

  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: "Unauthorized - Invalid token" }, 401);
  }

  // Attach user info to context
  c.set("userId", payload.userId);
  c.set("userEmail", payload.email);

  await next();
}

/**
 * POST /wardrobe
 * Add a new clothing item
 */
app.post("/make-server-644ccd78/wardrobe", authenticateUser, async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    const {
      category,
      primaryColor,
      secondaryColor,
      fit,
      fabric,
      occasionTags,
    } = body;

    // Validate required fields
    if (!category || !primaryColor || !fit || !fabric || !occasionTags) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Validate category
    const validCategories = [
      "shirt",
      "tshirt",
      "trousers",
      "jeans",
      "blazer",
      "sneakers",
      "formal_shoes",
      "boots",
    ];
    if (!validCategories.includes(category)) {
      return c.json({ error: "Invalid category" }, 400);
    }

    // Create clothing item
    const itemId = crypto.randomUUID();
    const item: ClothingItem = {
      id: itemId,
      userId,
      category,
      primaryColor,
      secondaryColor: secondaryColor || undefined,
      fit,
      fabric,
      occasionTags: Array.isArray(occasionTags) ? occasionTags : [occasionTags],
      createdAt: new Date().toISOString(),
    };

    // Store in KV
    await kv.set(`wardrobe:${userId}:${itemId}`, item);

    return c.json({ success: true, data: item });
  } catch (error) {
    console.error("Error adding wardrobe item:", error);
    return c.json({ error: "Failed to add item: " + error.message }, 500);
  }
});

/**
 * GET /wardrobe
 * Get all wardrobe items for user
 */
app.get("/make-server-644ccd78/wardrobe", authenticateUser, async (c) => {
  try {
    const userId = c.get("userId");

    // Get all items for this user
    const items = await kv.getByPrefix(`wardrobe:${userId}:`);

    return c.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching wardrobe:", error);
    return c.json({ error: "Failed to fetch wardrobe: " + error.message }, 500);
  }
});

/**
 * DELETE /wardrobe/:id
 * Delete a clothing item
 */
app.delete("/make-server-644ccd78/wardrobe/:id", authenticateUser, async (c) => {
  try {
    const userId = c.get("userId");
    const itemId = c.req.param("id");

    // Check if item exists and belongs to user
    const item = await kv.get(`wardrobe:${userId}:${itemId}`);

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    // Delete item
    await kv.del(`wardrobe:${userId}:${itemId}`);

    return c.json({ success: true, message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting wardrobe item:", error);
    return c.json({ error: "Failed to delete item: " + error.message }, 500);
  }
});

/**
 * PUT /wardrobe/:id
 * Update a clothing item
 */
app.put("/make-server-644ccd78/wardrobe/:id", authenticateUser, async (c) => {
  try {
    const userId = c.get("userId");
    const itemId = c.req.param("id");
    const body = await c.req.json();

    // Check if item exists and belongs to user
    const existingItem = await kv.get(`wardrobe:${userId}:${itemId}`) as ClothingItem;

    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    // Update item
    const updatedItem: ClothingItem = {
      ...existingItem,
      ...body,
      id: itemId, // Don't allow ID change
      userId, // Don't allow user change
      createdAt: existingItem.createdAt, // Keep original creation time
    };

    await kv.set(`wardrobe:${userId}:${itemId}`, updatedItem);

    return c.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Error updating wardrobe item:", error);
    return c.json({ error: "Failed to update item: " + error.message }, 500);
  }
});

// ==================== OUTFIT GENERATION ENDPOINTS ====================

/**
 * POST /outfit/generate
 * Generate outfit recommendations
 */
app.post("/make-server-644ccd78/outfit/generate", authenticateUser, async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    const { occasion, maxOutfits } = body;

    if (!occasion) {
      return c.json({ error: "Occasion is required" }, 400);
    }

    // Get user's wardrobe
    const items = await kv.getByPrefix(`wardrobe:${userId}:`);

    if (items.length === 0) {
      return c.json({
        error: "No wardrobe items found. Please add clothing items first.",
      }, 400);
    }

    // Generate outfits
    const outfits = generateOutfits(
      items as ClothingItem[],
      occasion,
      maxOutfits || 10
    );

    if (outfits.length === 0) {
      return c.json({
        success: true,
        data: [],
        message: "No suitable outfits found for this occasion. Try adding more items or selecting a different occasion.",
      });
    }

    // Save generation history
    const historyId = crypto.randomUUID();
    await kv.set(`outfit_history:${userId}:${historyId}`, {
      occasion,
      timestamp: new Date().toISOString(),
      outfitCount: outfits.length,
    });

    return c.json({
      success: true,
      data: outfits,
      message: `Generated ${outfits.length} outfit(s) for ${occasion}`,
    });
  } catch (error) {
    console.error("Error generating outfits:", error);
    return c.json({ error: "Failed to generate outfits: " + error.message }, 500);
  }
});

/**
 * POST /seed-data
 * Seed sample wardrobe data for testing (development only)
 */
app.post("/make-server-644ccd78/seed-data", authenticateUser, async (c) => {
  try {
    const userId = c.get("userId");

    // Sample wardrobe items
    const sampleItems: Partial<ClothingItem>[] = [
      // Tops
      {
        category: "shirt",
        primaryColor: "#FFFFFF",
        fit: "slim",
        fabric: "cotton",
        occasionTags: ["formal", "work"],
      },
      {
        category: "shirt",
        primaryColor: "#87CEEB",
        fit: "regular",
        fabric: "cotton",
        occasionTags: ["casual", "work"],
      },
      {
        category: "tshirt",
        primaryColor: "#000000",
        fit: "regular",
        fabric: "cotton",
        occasionTags: ["casual", "college"],
      },
      {
        category: "tshirt",
        primaryColor: "#FFFFFF",
        fit: "oversized",
        fabric: "cotton",
        occasionTags: ["casual", "college", "party"],
      },
      // Bottoms
      {
        category: "trousers",
        primaryColor: "#2C3E50",
        fit: "slim",
        fabric: "wool",
        occasionTags: ["formal", "work"],
      },
      {
        category: "jeans",
        primaryColor: "#1E3A5F",
        fit: "regular",
        fabric: "denim",
        occasionTags: ["casual", "college"],
      },
      {
        category: "trousers",
        primaryColor: "#8B7355",
        fit: "regular",
        fabric: "cotton",
        occasionTags: ["casual", "work"],
      },
      // Footwear
      {
        category: "formal_shoes",
        primaryColor: "#000000",
        fit: "regular",
        fabric: "leather",
        occasionTags: ["formal", "work"],
      },
      {
        category: "sneakers",
        primaryColor: "#FFFFFF",
        fit: "regular",
        fabric: "synthetic",
        occasionTags: ["casual", "college", "party"],
      },
      {
        category: "boots",
        primaryColor: "#654321",
        fit: "regular",
        fabric: "leather",
        occasionTags: ["casual", "party"],
      },
      // Layers
      {
        category: "blazer",
        primaryColor: "#2C3E50",
        fit: "slim",
        fabric: "wool",
        occasionTags: ["formal", "work", "party"],
      },
    ];

    // Create and store items
    const createdItems = [];
    for (const itemData of sampleItems) {
      const itemId = crypto.randomUUID();
      const item: ClothingItem = {
        id: itemId,
        userId,
        category: itemData.category!,
        primaryColor: itemData.primaryColor!,
        secondaryColor: itemData.secondaryColor,
        fit: itemData.fit!,
        fabric: itemData.fabric!,
        occasionTags: itemData.occasionTags!,
        createdAt: new Date().toISOString(),
      };

      await kv.set(`wardrobe:${userId}:${itemId}`, item);
      createdItems.push(item);
    }

    return c.json({
      success: true,
      message: `Seeded ${createdItems.length} sample items`,
      data: createdItems,
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return c.json({ error: "Failed to seed data: " + error.message }, 500);
  }
});

Deno.serve(app.fetch);
