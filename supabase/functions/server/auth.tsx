/**
 * Authentication Module
 * Handles user registration, login, and JWT token generation
 */

import * as kv from "./kv_store.tsx";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthToken {
  token: string;
  userId: string;
  email: string;
  name: string;
}

/**
 * Simple hash function (in production, use bcrypt or similar)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate JWT-style token (simplified)
 */
function generateToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  // In production, use proper JWT library with signing
  return btoa(JSON.stringify(payload));
}

/**
 * Verify token
 */
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

/**
 * Register new user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; message?: string; data?: AuthToken }> {
  // Validate input
  if (!email || !password || !name) {
    return { success: false, message: "All fields are required" };
  }

  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  // Check if user already exists
  const existingUsers = await kv.getByPrefix("user:");
  const userExists = existingUsers.some(
    (u: User) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (userExists) {
    return { success: false, message: "User with this email already exists" };
  }

  // Create new user
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await kv.set(`user:${userId}`, newUser);
  await kv.set(`user:email:${email.toLowerCase()}`, userId); // Email index

  // Generate token
  const token = generateToken(userId, email);

  return {
    success: true,
    data: {
      token,
      userId,
      email,
      name,
    },
  };
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; data?: AuthToken }> {
  // Validate input
  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  // Get user ID from email index
  const userId = await kv.get(`user:email:${email.toLowerCase()}`);

  if (!userId) {
    return { success: false, message: "Invalid email or password" };
  }

  // Get user data
  const user = await kv.get(`user:${userId}`) as User;

  if (!user) {
    return { success: false, message: "Invalid email or password" };
  }

  // Verify password
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { success: false, message: "Invalid email or password" };
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  return {
    success: true,
    data: {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

/**
 * Get user from token
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await kv.get(`user:${payload.userId}`) as User;
  return user || null;
}
