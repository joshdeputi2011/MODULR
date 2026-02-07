/**
 * API Client for WardrobeAI Backend
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-644ccd78`;

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('wardrobeai_token');
}

// Set auth token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('wardrobeai_token', token);
}

// Remove auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('wardrobeai_token');
}

// Get user data from localStorage
export function getUserData(): any {
  const data = localStorage.getItem('wardrobeai_user');
  return data ? JSON.parse(data) : null;
}

// Set user data in localStorage
export function setUserData(user: any): void {
  localStorage.setItem('wardrobeai_user', JSON.stringify(user));
}

// Remove user data from localStorage
export function removeUserData(): void {
  localStorage.removeItem('wardrobeai_user');
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
  } else {
    // Use public anon key for non-authenticated requests
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
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

export async function register(data: RegisterData) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: data,
  });

  if (response.success && response.data) {
    setAuthToken(response.data.token);
    setUserData({
      userId: response.data.userId,
      email: response.data.email,
      name: response.data.name,
    });
  }

  return response;
}

export async function login(data: LoginData) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: data,
  });

  if (response.success && response.data) {
    setAuthToken(response.data.token);
    setUserData({
      userId: response.data.userId,
      email: response.data.email,
      name: response.data.name,
    });
  }

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

export interface GenerateOutfitRequest {
  occasion: string;
  maxOutfits?: number;
}

export async function generateOutfits(request: GenerateOutfitRequest) {
  return await apiRequest('/outfit/generate', {
    method: 'POST',
    body: request,
    requireAuth: true,
  });
}

// ==================== DEVELOPMENT API ====================

export async function seedSampleData() {
  return await apiRequest('/seed-data', {
    method: 'POST',
    requireAuth: true,
  });
}
