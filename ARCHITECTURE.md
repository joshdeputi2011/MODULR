# WardrobeAI - Technical Architecture Documentation

## System Overview

WardrobeAI is a full-stack web application that provides AI-powered outfit recommendations based on color theory, occasion matching, and wardrobe compatibility algorithms.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   React +   │  │  Tailwind    │  │   Radix UI       │  │
│  │  TypeScript │  │    CSS       │  │  Components      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  Components:                                                 │
│  • AuthForm          • WardrobeManager                      │
│  • AddItemDialog     • OutfitGenerator                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
                            │ JWT Auth
┌───────────────────────────▼─────────────────────────────────┐
│                       API LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Hono Web Framework (Deno)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Endpoints:                                                  │
│  • /auth/*          • /wardrobe/*      • /outfit/*         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Auth     │  │    Color     │  │     Outfit       │  │
│  │   Module    │  │   Engine     │  │   Generator      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  • JWT tokens       • HSV conversion  • Compatibility       │
│  • Password hash    • Color theory    • Ranking algo       │
│  • User sessions    • Scoring rules   • Explanation gen    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Supabase Key-Value Store (PostgreSQL)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Data Models:                                                │
│  • user:{id}               → User record                    │
│  • user:email:{email}      → Email index                    │
│  • wardrobe:{userId}:{id}  → Clothing items                 │
│  • outfit_history:{userId} → Generation history             │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Details

### Frontend Technologies

**Framework & Language**
- **React 18.3.1**: Component-based UI library
- **TypeScript**: Type-safe development
- **Vite 6.3.5**: Build tool and dev server

**Styling**
- **Tailwind CSS 4.1.12**: Utility-first CSS framework
- **next-themes**: Dark mode support
- **CSS Variables**: Custom theming system

**UI Components**
- **Radix UI**: Accessible primitive components
  - Dialog, Select, Tabs, Tooltip, etc.
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

**State Management**
- **React Hooks**: useState, useEffect
- **Local Storage**: Auth token persistence
- **Component State**: UI state management

### Backend Technologies

**Runtime & Framework**
- **Deno**: Modern JavaScript/TypeScript runtime
- **Hono**: Lightweight web framework
  - Fast routing
  - Middleware support
  - Type-safe

**Database**
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Key-Value store abstraction
  - Real-time capabilities (unused currently)

**Authentication**
- **Custom JWT**: Token-based auth
- **SHA-256**: Password hashing (simplified)
- **Bearer tokens**: Authorization headers

---

## Data Models & Schema

### User Model

```typescript
interface User {
  id: string;              // UUID
  email: string;           // Unique, lowercase
  name: string;            // Display name
  passwordHash: string;    // SHA-256 hash
  createdAt: string;       // ISO timestamp
}
```

**Storage Keys**:
- `user:{userId}` → Full user object
- `user:email:{email}` → userId (for email lookup)

### Clothing Item Model

```typescript
interface ClothingItem {
  id: string;                    // UUID
  userId: string;                // Owner reference
  category: ClothingCategory;    // Type of item
  primaryColor: string;          // Hex color (#RRGGBB)
  secondaryColor?: string;       // Optional second color
  fit: 'slim' | 'regular' | 'oversized';
  fabric: 'cotton' | 'denim' | 'wool' | 'leather' | 'synthetic';
  occasionTags: string[];        // ['formal', 'casual', ...]
  createdAt: string;             // ISO timestamp
}

type ClothingCategory =
  | 'shirt' | 'tshirt'           // Tops
  | 'trousers' | 'jeans'         // Bottoms
  | 'sneakers' | 'formal_shoes' | 'boots'  // Footwear
  | 'blazer';                    // Layers
```

**Storage Keys**:
- `wardrobe:{userId}:{itemId}` → Clothing item object

### Outfit Combination Model

```typescript
interface OutfitCombination {
  top: ClothingItem;
  bottom: ClothingItem;
  footwear: ClothingItem;
  layer?: ClothingItem;          // Optional blazer/jacket
  compatibilityScore: number;     // 0-1
  colorScore: number;             // 0-1
  explanation: string;            // Human-readable reason
  shoeRecommendation: string;     // Footwear advice
}
```

---

## Core Algorithms

### 1. Color Harmony Engine

**File**: `/supabase/functions/server/color-engine.tsx`

#### HSV Color Conversion

```typescript
// RGB → HSV transformation
function rgbToHsv(rgb: RGB): HSV {
  // Normalize RGB values to 0-1
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Find max and min values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  // Calculate Hue (0-360°)
  let h = 0;
  if (diff === 0) h = 0;
  else if (max === r) h = ((g - b) / diff) % 6;
  else if (max === g) h = (b - r) / diff + 2;
  else h = (r - g) / diff + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // Calculate Saturation (0-100%)
  const s = max === 0 ? 0 : (diff / max) * 100;

  // Calculate Value/Brightness (0-100%)
  const v = max * 100;

  return { h, s, v };
}
```

#### Neutral Color Detection

```typescript
function isNeutral(hsv: HSV): boolean {
  // Low saturation (< 20%)
  if (hsv.s < 20) return true;

  // Navy blue (210-240° hue, < 60% saturation)
  if (hsv.h >= 210 && hsv.h <= 240 && hsv.s < 60) return true;

  // Beige/tan (30-50° hue, < 40% saturation)
  if (hsv.h >= 30 && hsv.h <= 50 && hsv.s < 40) return true;

  return false;
}
```

#### Color Relationship Detection

```typescript
// Complementary colors (opposite on color wheel)
function areComplementary(hsv1: HSV, hsv2: HSV): boolean {
  const hueDiff = Math.abs(hsv1.h - hsv2.h);
  return (hueDiff >= 150 && hueDiff <= 210) ||
         (hueDiff >= 330 || hueDiff <= 30);
}

// Analogous colors (adjacent on color wheel)
function areAnalogous(hsv1: HSV, hsv2: HSV): boolean {
  const hueDiff = Math.abs(hsv1.h - hsv2.h);
  return hueDiff <= 60;
}

// Contrast calculation
function calculateContrast(hsv1: HSV, hsv2: HSV): number {
  const valueDiff = Math.abs(hsv1.v - hsv2.v);
  const saturationDiff = Math.abs(hsv1.s - hsv2.s);
  return (valueDiff + saturationDiff) / 200; // Normalize to 0-1
}
```

#### Compatibility Scoring Algorithm

```typescript
function calculateColorCompatibility(
  topColor: string,
  bottomColor: string,
  shoeColor: string,
  occasion: string
): { score: number; explanation: string } {
  // Initialize base score
  let score = 0.5;
  const reasons: string[] = [];

  // Convert to HSV
  const topHsv = hexToHsv(topColor);
  const bottomHsv = hexToHsv(bottomColor);
  const shoeHsv = hexToHsv(shoeColor);

  // Rule 1: All neutrals (+0.3)
  if (allNeutral) {
    score += 0.3;
    reasons.push("All neutral colors create sophisticated look");
  }

  // Rule 2: Dark top + Light bottom (+0.15)
  if (topHsv.v < 40 && bottomHsv.v > 60) {
    score += 0.15;
    reasons.push("Dark top with light bottom creates balance");
  }

  // Rule 3: Complementary colors (occasion-dependent)
  if (areComplementary(topHsv, bottomHsv)) {
    if (occasion === 'casual' || occasion === 'party') {
      score += 0.1;
    } else {
      score -= 0.1;
    }
  }

  // Rule 4: Analogous harmony (+0.15)
  if (areAnalogous(topHsv, bottomHsv)) {
    score += 0.15;
    reasons.push("Analogous colors create harmony");
  }

  // Rule 5: Occasion contrast rules
  const contrast = calculateContrast(topHsv, bottomHsv);
  if (occasion === 'formal' && contrast < 0.3) {
    score += 0.15;
  }

  // Rule 6: Bold top + neutral shoes (+0.1)
  if (topHsv.s > 60 && isNeutral(shoeHsv)) {
    score += 0.1;
    reasons.push("Neutral footwear balances bold top");
  }

  // Normalize to 0-1
  score = Math.max(0, Math.min(1, score));

  return { score, explanation: reasons.join(". ") };
}
```

### 2. Outfit Generation Algorithm

**File**: `/supabase/functions/server/outfit-generator.tsx`

#### Generation Process

```typescript
function generateOutfits(
  items: ClothingItem[],
  occasion: string,
  maxOutfits: number = 10
): OutfitCombination[] {
  // Step 1: Categorize items
  const tops = items.filter(item =>
    ['shirt', 'tshirt'].includes(item.category)
  );
  const bottoms = items.filter(item =>
    ['trousers', 'jeans'].includes(item.category)
  );
  const footwear = items.filter(item =>
    ['sneakers', 'formal_shoes', 'boots'].includes(item.category)
  );
  const layers = items.filter(item =>
    item.category === 'blazer'
  );

  const outfits: OutfitCombination[] = [];

  // Step 2: Generate all combinations
  for (const top of tops) {
    // Filter by occasion
    if (!top.occasionTags.includes(occasion)) continue;

    for (const bottom of bottoms) {
      if (!bottom.occasionTags.includes(occasion)) continue;

      for (const shoe of footwear) {
        if (!shoe.occasionTags.includes(occasion)) continue;

        // Step 3: Check basic requirements
        if (!meetsOccasionRequirements(top, bottom, shoe, occasion)) {
          continue;
        }

        // Step 4: Calculate scores
        const colorResult = calculateColorCompatibility(
          top.primaryColor,
          bottom.primaryColor,
          shoe.primaryColor,
          occasion
        );

        const fitScore = calculateFitCompatibility(top, bottom);
        const fabricScore = calculateFabricCompatibility(
          top, bottom, occasion
        );

        // Step 5: Calculate overall compatibility
        const compatibilityScore =
          colorResult.score * 0.5 +  // 50% weight
          fitScore +                 // 25% weight (max 0.3)
          fabricScore;               // 25% weight (max 0.25)

        // Step 6: Add optional layer
        let layer = undefined;
        if (occasion === 'formal' || occasion === 'work') {
          layer = layers.find(l =>
            l.occasionTags.includes(occasion)
          );
        }

        // Step 7: Create outfit combination
        outfits.push({
          top,
          bottom,
          footwear: shoe,
          layer,
          compatibilityScore,
          colorScore: colorResult.score,
          explanation: colorResult.explanation,
          shoeRecommendation: getShoeRecommendation(
            top.primaryColor,
            bottom.primaryColor,
            occasion
          ),
        });
      }
    }
  }

  // Step 8: Sort by compatibility (descending)
  outfits.sort((a, b) =>
    b.compatibilityScore - a.compatibilityScore
  );

  // Step 9: Return top N outfits
  return outfits.slice(0, maxOutfits);
}
```

#### Fit Compatibility Rules

```typescript
function calculateFitCompatibility(
  top: ClothingItem,
  bottom: ClothingItem
): number {
  // Matching fits = Best (0.3)
  if (top.fit === bottom.fit) return 0.3;

  // Slim top + Regular bottom = Good (0.25)
  if (top.fit === 'slim' && bottom.fit === 'regular') return 0.25;

  // Regular top + Slim bottom = Acceptable (0.2)
  if (top.fit === 'regular' && bottom.fit === 'slim') return 0.2;

  // Oversized combinations = Casual only (0.1)
  if (top.fit === 'oversized' || bottom.fit === 'oversized') return 0.1;

  // Default (0.15)
  return 0.15;
}
```

#### Fabric Compatibility Rules

```typescript
function calculateFabricCompatibility(
  top: ClothingItem,
  bottom: ClothingItem,
  occasion: string
): number {
  // Formal: Cotton/Wool preferred (0.25)
  if (occasion === 'formal') {
    if ((top.fabric === 'cotton' || top.fabric === 'wool') &&
        (bottom.fabric === 'wool' || bottom.fabric === 'cotton')) {
      return 0.25;
    }
  }

  // Casual: Denim works well (0.2)
  if (occasion === 'casual' || occasion === 'college') {
    if (bottom.fabric === 'denim') return 0.2;
  }

  // Mixed cotton/wool (0.2)
  if (top.fabric === 'cotton' && bottom.fabric === 'wool') return 0.2;

  // Default (0.15)
  return 0.15;
}
```

### 3. Authentication System

**File**: `/supabase/functions/server/auth.tsx`

#### Password Hashing (Simplified)

```typescript
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
```

⚠️ **Production Note**: Use bcrypt or Argon2 instead of SHA-256.

#### JWT Token Generation (Simplified)

```typescript
function generateToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  // Base64 encode (NOT secure for production!)
  return btoa(JSON.stringify(payload));
}
```

⚠️ **Production Note**: Use proper JWT library with HMAC/RSA signing.

#### Token Verification

```typescript
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = JSON.parse(atob(token));
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}
```

---

## API Endpoints Specification

### Authentication Endpoints

#### POST /auth/register

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "userId": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response** (Error):
```json
{
  "error": "User with this email already exists"
}
```

#### POST /auth/login

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: Same as register

#### GET /auth/me

**Headers**:
```
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-07T10:00:00Z"
  }
}
```

### Wardrobe Endpoints

#### POST /wardrobe

**Headers**:
```
Authorization: Bearer {token}
```

**Request**:
```json
{
  "category": "shirt",
  "primaryColor": "#FFFFFF",
  "secondaryColor": "#0000FF",
  "fit": "slim",
  "fabric": "cotton",
  "occasionTags": ["formal", "work"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "item-uuid",
    "userId": "user-uuid",
    "category": "shirt",
    "primaryColor": "#FFFFFF",
    "secondaryColor": "#0000FF",
    "fit": "slim",
    "fabric": "cotton",
    "occasionTags": ["formal", "work"],
    "createdAt": "2026-02-07T10:00:00Z"
  }
}
```

#### GET /wardrobe

**Headers**:
```
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    { /* ClothingItem 1 */ },
    { /* ClothingItem 2 */ }
  ]
}
```

#### PUT /wardrobe/:id

**Headers**:
```
Authorization: Bearer {token}
```

**Request**: Partial ClothingItem update

#### DELETE /wardrobe/:id

**Headers**:
```
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "message": "Item deleted"
}
```

### Outfit Generation Endpoint

#### POST /outfit/generate

**Headers**:
```
Authorization: Bearer {token}
```

**Request**:
```json
{
  "occasion": "formal",
  "maxOutfits": 10
}
```

**Response**:
```json
{
  "success": true,
  "message": "Generated 5 outfit(s) for formal",
  "data": [
    {
      "top": { /* ClothingItem */ },
      "bottom": { /* ClothingItem */ },
      "footwear": { /* ClothingItem */ },
      "layer": { /* ClothingItem or null */ },
      "compatibilityScore": 0.85,
      "colorScore": 0.92,
      "explanation": "All neutral colors create sophisticated look. Low contrast improves formal appearance.",
      "shoeRecommendation": "Black leather shoes for formal elegance"
    }
  ]
}
```

---

## Frontend Architecture

### Component Hierarchy

```
App (Main Entry Point)
├── ThemeProvider
│   ├── Toaster (Global notifications)
│   │
│   ├── Auth Flow (Not logged in)
│   │   └── AuthForm
│   │       ├── Login mode
│   │       └── Register mode
│   │
│   └── Main App (Logged in)
│       ├── Header
│       │   ├── Logo
│       │   ├── User info
│       │   └── Logout button
│       │
│       ├── Tabs
│       │   ├── Wardrobe Tab
│       │   │   └── WardrobeManager
│       │   │       ├── Item cards
│       │   │       ├── Add button
│       │   │       └── Empty state
│       │   │
│       │   └── Generate Tab
│       │       └── OutfitGenerator
│       │           ├── Occasion selector
│       │           ├── Generate button
│       │           └── Outfit cards
│       │
│       ├── AddItemDialog (Modal)
│       │   ├── Form fields
│       │   └── Color pickers
│       │
│       └── Footer
```

### State Management Strategy

**Global State** (localStorage):
- `wardrobeai_token`: JWT auth token
- `wardrobeai_user`: User data object

**Component State**:
- Auth mode (login/register)
- Active tab
- Modal visibility
- Form data
- Loading states
- API responses

**Server State**:
- Wardrobe items (fetched on demand)
- Outfit combinations (generated on request)
- User info (verified from token)

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Call (via lib/api.ts)
    ↓
HTTP Request to Backend
    ↓
Backend Processing
    ↓
Database Query/Update
    ↓
Response to Frontend
    ↓
State Update
    ↓
React Re-render
    ↓
UI Update
```

---

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**
   - Dynamic imports for heavy components
   - Lazy loading of API client

2. **Memoization**
   - useCallback for event handlers
   - useMemo for expensive calculations

3. **Efficient Rendering**
   - Key props on lists
   - Controlled re-renders
   - Debounced inputs

### Backend Optimization

1. **Database Queries**
   - Prefix-based lookups (O(log n))
   - Indexed email lookups
   - Batch operations where possible

2. **Algorithm Efficiency**
   - Early filtering by occasion
   - Pruning invalid combinations
   - Top-N selection instead of full sort

3. **Response Size**
   - Return only necessary data
   - Pagination for large lists (future)
   - Compression (handled by Supabase)

---

## Security Considerations

### Current Implementation (Prototype)

⚠️ **NOT PRODUCTION-READY**

**Weaknesses**:
1. SHA-256 for passwords (too fast)
2. Unsigned JWT tokens (can be forged)
3. No rate limiting
4. No email verification
5. No HTTPS enforcement
6. Client-side token storage

### Production Recommendations

1. **Password Security**
   ```typescript
   import bcrypt from 'bcrypt';
   const hash = await bcrypt.hash(password, 10);
   ```

2. **JWT Security**
   ```typescript
   import jwt from 'jsonwebtoken';
   const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
   ```

3. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

4. **Input Validation**
   ```typescript
   import { z } from 'zod';
   const schema = z.object({
     email: z.string().email(),
     password: z.string().min(8),
   });
   ```

5. **HTTPS Only**
   - Enforce SSL/TLS
   - HSTS headers
   - Secure cookies

6. **CORS Configuration**
   ```typescript
   cors({
     origin: process.env.ALLOWED_ORIGINS,
     credentials: true,
   })
   ```

---

## Testing Strategy

### Unit Tests (Recommended)

```typescript
// color-engine.test.ts
describe('Color Engine', () => {
  test('hexToRgb converts correctly', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  test('isNeutral detects neutrals', () => {
    expect(isNeutral({ h: 0, s: 10, v: 50 })).toBe(true);
    expect(isNeutral({ h: 220, s: 50, v: 50 })).toBe(true); // Navy
  });

  test('complementary colors detected', () => {
    const red = { h: 0, s: 100, v: 100 };
    const cyan = { h: 180, s: 100, v: 100 };
    expect(areComplementary(red, cyan)).toBe(true);
  });
});
```

### Integration Tests (Recommended)

```typescript
// api.test.ts
describe('API Integration', () => {
  test('user registration flow', async () => {
    const response = await register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    expect(response.success).toBe(true);
    expect(response.data.token).toBeDefined();
  });

  test('outfit generation', async () => {
    // Setup: Add sample items
    // Generate outfits
    // Assert: Valid combinations returned
  });
});
```

### Manual Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Add clothing items (all categories)
- [ ] Edit clothing items
- [ ] Delete clothing items
- [ ] Generate outfits (all occasions)
- [ ] Verify color recommendations
- [ ] Test with empty wardrobe
- [ ] Test with minimal wardrobe
- [ ] Test logout/login persistence

---

## Future Enhancements

### ML Integration Roadmap

**Phase 1: Data Collection**
- Track user interactions
- Record outfit selections
- Collect feedback

**Phase 2: Feature Engineering**
```python
def extract_features(outfit):
    return {
        'top_hsv': convert_to_hsv(outfit.top.color),
        'bottom_hsv': convert_to_hsv(outfit.bottom.color),
        'shoe_hsv': convert_to_hsv(outfit.shoe.color),
        'fit_match': int(outfit.top.fit == outfit.bottom.fit),
        'fabric_formal': int(is_formal_fabric(outfit.top.fabric)),
        'season': get_season_encoding(),
        'occasion': one_hot_encode(outfit.occasion)
    }
```

**Phase 3: Model Training**
```python
from sklearn.ensemble import RandomForestClassifier

# Train on historical data
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Predict compatibility
score = model.predict_proba(features)[0][1]
```

**Phase 4: Integration**
- FastAPI service for predictions
- Hybrid scoring (rule-based + ML)
- A/B testing framework

### Additional Features

1. **Weather Integration**
   - API for local weather
   - Fabric recommendations based on temperature
   - Seasonal outfit filtering

2. **Image Upload**
   - Take photos of clothing
   - Color extraction from images
   - Visual wardrobe display

3. **Social Features**
   - Share outfits
   - Community ratings
   - Style inspiration

4. **Advanced Filters**
   - Budget tracking
   - Brand preferences
   - Occasion calendar

5. **Analytics Dashboard**
   - Most worn items
   - Color palette analysis
   - Wardrobe gaps identification

---

## Deployment Guide

### Prerequisites
- Supabase project
- Environment variables configured
- Build pipeline setup

### Build Process

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Deploy backend (Supabase CLI)
supabase functions deploy server
```

### Environment Variables

```env
# Frontend (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Backend (Supabase Dashboard)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Monitoring

- **Error Tracking**: Sentry or similar
- **Analytics**: Google Analytics
- **Performance**: Lighthouse CI
- **Logs**: Supabase logs dashboard

---

## Contributing Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configuration
- **Formatting**: Prettier
- **Naming**: camelCase for variables, PascalCase for components

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/outfit-filters

# Make changes and commit
git commit -m "Add outfit filtering by season"

# Push and create PR
git push origin feature/outfit-filters
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots (if applicable)
```

---

## License & Attribution

**Project**: WardrobeAI  
**Purpose**: Educational demonstration  
**License**: MIT (or specify)  

**Built with**:
- React, TypeScript, Tailwind CSS
- Deno, Hono, Supabase
- Radix UI, Lucide Icons, Sonner

---

**Maintainer**: WardrobeAI Development Team  
**Last Updated**: February 7, 2026  
**Version**: 1.0.0
