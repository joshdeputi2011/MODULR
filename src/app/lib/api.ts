/**
 * API Client for MODULR Backend
 */

const API_BASE_URL = 'https://api.example.com'; // Reserved for future use
const AUTH_BASE_URL = ((import.meta as any).env?.VITE_AUTH_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('modulr_token');
}

// Set auth token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('modulr_token', token);
}

// Remove auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('modulr_token');
}

// Get user data from localStorage
export function getUserData(): any {
  const data = localStorage.getItem('modulr_user');
  return data ? JSON.parse(data) : null;
}

// Set user data in localStorage
export function setUserData(user: any): void {
  localStorage.setItem('modulr_user', JSON.stringify(user));
}

// Remove user data from localStorage
export function removeUserData(): void {
  localStorage.removeItem('modulr_user');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

interface ApiOptions {
  method?: string;
  body?: any;
  requireAuth?: boolean;
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, requireAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available or required
  const token = getAuthToken();
  if (requireAuth && !token) {
    throw new Error('Authentication required');
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ==================== AUTH API ====================

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
}

async function authRequest<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let data: any = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.detail || data?.error || data?.message || 'API request failed';
    throw new Error(message);
  }

  return data as T;
}

export async function register(data: RegisterData) {
  const response = await authRequest<AuthResponse>('/register', data);

  setAuthToken(response.token);
  setUserData({
    userId: response.userId,
    email: response.email,
    name: response.name,
  });

  return response;
}

export async function login(data: LoginData) {
  const response = await authRequest<AuthResponse>('/login', data);

  setAuthToken(response.token);
  setUserData({
    userId: response.userId,
    email: response.email,
    name: response.name,
  });

  return response;
}

export async function logout() {
  removeAuthToken();
  removeUserData();
}

export async function getCurrentUser() {
  return await apiRequest('/auth/me', { requireAuth: true });
}

// ==================== WARDROBE API ====================

export interface ClothingItem {
  id?: string;
  userId?: string;
  category: string;
  primaryColor: string;
  secondaryColor?: string;
  fit: string;
  fabric: string;
  occasionTags: string[];
  createdAt?: string;
}

export async function addClothingItem(item: ClothingItem) {
  return await apiRequest('/wardrobe', {
    method: 'POST',
    body: item,
    requireAuth: true,
  });
}

export async function getWardrobe() {
  return await apiRequest('/wardrobe', { requireAuth: true });
}

export async function updateClothingItem(id: string, item: Partial<ClothingItem>) {
  return await apiRequest(`/wardrobe/${id}`, {
    method: 'PUT',
    body: item,
    requireAuth: true,
  });
}

export async function deleteClothingItem(id: string) {
  return await apiRequest(`/wardrobe/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}

// ==================== OUTFIT API ====================

// ==================== OUTFIT API ====================

export interface GenerateOutfitRequest {
  occasion: string;
  maxOutfits?: number;
}

const ML_BASE_URL = "http://127.0.0.1:8000";

export async function generateOutfits(request: GenerateOutfitRequest) {
  const response = await fetch(`${ML_BASE_URL}/generate-outfit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate outfits");
  }

  return data;
}


// ==================== DEVELOPMENT API ====================

export async function seedSampleData() {
  return await apiRequest('/seed-data', {
    method: 'POST',
    requireAuth: true,
  });
}

