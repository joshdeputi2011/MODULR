# WardrobeAI 👔✨

**AI-Powered Outfit Recommendation System for Men**

WardrobeAI helps you generate visually appealing outfits from your existing wardrobe based on occasion and color harmony. Built with modern web technologies and intelligent color theory algorithms.

---

## 🎯 Features

### 1. **User Authentication**
- JWT-based authentication system
- User registration and login
- Secure password hashing
- Each user has a private wardrobe

### 2. **Wardrobe Management**
- Add, edit, delete, and view clothing items
- Comprehensive item attributes:
  - Category (shirt, t-shirt, trousers, jeans, blazer, sneakers, formal shoes, boots)
  - Primary and secondary colors
  - Fit (slim, regular, oversized)
  - Fabric (cotton, denim, wool, leather, synthetic)
  - Occasion tags (formal, casual, work, college, party, travel)

### 3. **Outfit Generation System**
- AI-powered outfit recommendations
- Two-axis recommendation:
  1. **Clothing Type Compatibility**: Ensures proper combinations (top + bottom + footwear + optional layer)
  2. **Occasion Compatibility**: Matches items to the selected occasion

### 4. **Color Palette Intelligence**
- **Rule-Based Color Engine** using color theory:
  - Complementary colors detection
  - Analogous colors harmony
  - Neutral color balancing (black, white, grey, beige, navy)
- **Smart Color Rules**:
  - Dark tops → light bottoms recommended
  - Bold tops → neutral footwear
  - Formal outfits → low contrast
  - Casual outfits → medium contrast
- Returns compatibility scores (0-100%)

### 5. **Footwear Intelligence**
- Occasion-specific footwear recommendations:
  - **Formal** → Leather shoes only
  - **Casual/College** → Sneakers allowed
  - **Party** → Flexible options
- Smart pairing rules (e.g., brown shoes with earth tones)
- White sneakers as universal casual match

### 6. **Explanation Engine**
- Each recommendation includes human-readable explanations:
  - "Neutral shoes balance bold colors"
  - "Low contrast improves formal appearance"
  - "Analogous colors create harmony"

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **Runtime**: Deno (Supabase Edge Functions)
- **Framework**: Hono (lightweight web framework)
- **Database**: Supabase Key-Value Store
- **Authentication**: JWT tokens (simplified implementation)

### Color Engine
- Custom HSV/RGB color conversion algorithms
- Color theory implementation (complementary, analogous, neutral detection)
- Compatibility scoring system

---

## 📁 Project Structure

```
wardrobeai/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── AuthForm.tsx           # Login/Register form
│   │   │   ├── WardrobeManager.tsx    # Wardrobe display & management
│   │   │   ├── AddItemDialog.tsx      # Add/Edit item modal
│   │   │   ├── OutfitGenerator.tsx    # Outfit generation interface
│   │   │   └── ui/                    # Reusable UI components
│   │   ├── lib/
│   │   │   └── api.ts                 # API client & helpers
│   │   └── App.tsx                    # Main application component
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx              # Main server & API routes
│           ├── auth.tsx               # Authentication logic
│           ├── color-engine.tsx       # Color harmony algorithms
│           ├── outfit-generator.tsx   # Outfit generation logic
│           └── kv_store.tsx           # Database utilities (protected)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Deno
- Supabase account (already connected in this environment)

### Initial Setup

1. **Register an Account**
   - Open the application
   - Click "Create Account"
   - Fill in your name, email, and password (min 6 characters)

2. **Add Wardrobe Items**
   - Click "Load Sample Items" for a quick start, OR
   - Click "Add Item" to manually add your clothing:
     - Select category, fit, and fabric
     - Choose primary color (and optional secondary color)
     - Select applicable occasions
     - Click "Add Item"

3. **Generate Outfits**
   - Navigate to "Generate Outfits" tab
   - Select an occasion (Formal, Casual, Work, College, Party, Travel)
   - Click "Generate Outfits"
   - View ranked outfit recommendations with explanations

---

## 🎨 Color Engine Details

### HSV Color Space
The system converts all colors to HSV (Hue, Saturation, Value) for better color analysis:
- **Hue (0-360°)**: The color itself (red, blue, green, etc.)
- **Saturation (0-100%)**: Color intensity
- **Value (0-100%)**: Brightness

### Color Compatibility Rules

1. **Neutral Detection**
   - Saturation < 20%
   - Navy (hue 210-240°, saturation < 60%)
   - Beige (hue 30-50°, saturation < 40%)

2. **Complementary Colors**
   - Hue difference of 150-210° (opposite on color wheel)
   - Great for casual/party, avoid for formal

3. **Analogous Colors**
   - Hue difference < 60° (adjacent on color wheel)
   - Creates harmonious looks

4. **Contrast Calculation**
   - Based on value and saturation differences
   - Low contrast (< 30%) for formal
   - Medium contrast (40-70%) for casual

### Scoring Algorithm

Outfit compatibility score is calculated from:
- **Color Score (50% weight)**: Color harmony analysis
- **Fit Score (25% weight)**: Matching/complementary fits
- **Fabric Score (25% weight)**: Occasion-appropriate fabrics

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Wardrobe Management
- `POST /wardrobe` - Add clothing item
- `GET /wardrobe` - Get all items for user
- `PUT /wardrobe/:id` - Update item
- `DELETE /wardrobe/:id` - Delete item

### Outfit Generation
- `POST /outfit/generate` - Generate outfit recommendations
  ```json
  {
    "occasion": "formal",
    "maxOutfits": 10
  }
  ```

### Development
- `POST /seed-data` - Load sample wardrobe data

---

## 🧪 Testing the Application

### Sample Wardrobe Data
Use "Load Sample Items" to add:
- 2 Shirts (white, sky blue)
- 2 T-shirts (black, white)
- 3 Bottoms (navy trousers, blue jeans, khaki trousers)
- 3 Footwear (black formal shoes, white sneakers, brown boots)
- 1 Blazer (navy)

### Test Scenarios

1. **Formal Occasion**
   - Should recommend: Shirt + Trousers + Formal Shoes + Blazer
   - Should avoid: T-shirts, jeans, sneakers

2. **Casual Occasion**
   - Should recommend: T-shirt + Jeans + Sneakers
   - Should allow: Mix of fits and colors

3. **Color Harmony**
   - White shirt + Navy trousers = High score (neutrals)
   - Black t-shirt + Blue jeans = Good score (dark top, medium bottom)
   - Bold colors together = Lower score with explanation

---

## 🎯 Future Enhancements (ML Integration)

The current system uses sophisticated rule-based algorithms. To add real ML:

### 1. **Data Collection**
- Track user preferences (which outfits they wear)
- Collect feedback on recommendations

### 2. **Feature Engineering**
```python
features = {
  'top_hue': hsv_values[0],
  'top_saturation': hsv_values[1],
  'top_value': hsv_values[2],
  'bottom_hue': hsv_values[3],
  'bottom_saturation': hsv_values[4],
  'bottom_value': hsv_values[5],
  'shoe_hue': hsv_values[6],
  'fit_match': 1 if matching else 0,
  'occasion_type': encoded_occasion
}
```

### 3. **Model Training**
- Algorithm: Random Forest or XGBoost
- Target: User preference score
- Train on collected outfit data

### 4. **Python FastAPI Service**
```python
from fastapi import FastAPI
import numpy as np
from sklearn.ensemble import RandomForestClassifier

app = FastAPI()

@app.post("/predict-outfit")
def predict(features: dict):
    # Extract features
    X = extract_features(features)
    # Predict compatibility
    score = model.predict_proba(X)
    return {"score": score, "recommendation": "..."}
```

---

## 🔒 Security Notes

⚠️ **Important**: This is a prototype implementation for learning purposes.

- Password hashing uses SHA-256 (production should use bcrypt/argon2)
- JWT tokens are base64-encoded (production should use proper signing)
- No email verification implemented
- Not suitable for production use with real user data

For production deployment:
1. Implement proper password hashing (bcrypt)
2. Use signed JWT tokens with expiration
3. Add email verification
4. Implement rate limiting
5. Add HTTPS enforcement
6. Follow OWASP security guidelines

---

## 🎨 Design Philosophy

### Minimalist Fashion UI
- Clean, uncluttered interface
- Focus on visual color representation
- Clear compatibility scores
- Emoji icons for quick recognition
- Smooth transitions and animations

### User Experience
- Intuitive navigation
- Instant feedback with toast notifications
- Loading states for all async operations
- Responsive design (mobile-friendly)
- Accessibility considerations

---

## 🐛 Troubleshooting

### No outfits generated?
- Ensure you have at least one item in each category (top, bottom, footwear)
- Check that items are tagged for the selected occasion
- Try a different occasion

### Colors not displaying correctly?
- Use hex color format (#RRGGBB)
- Color picker provides correct format automatically

### Can't login after registration?
- Check that password is at least 6 characters
- Ensure email is valid format
- Try refreshing the page

---

## 📊 Data Schema

### User Object
```typescript
{
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}
```

### Clothing Item Object
```typescript
{
  id: string;
  userId: string;
  category: 'shirt' | 'tshirt' | 'trousers' | 'jeans' | 'blazer' | 'sneakers' | 'formal_shoes' | 'boots';
  primaryColor: string;  // Hex color
  secondaryColor?: string;
  fit: 'slim' | 'regular' | 'oversized';
  fabric: 'cotton' | 'denim' | 'wool' | 'leather' | 'synthetic';
  occasionTags: string[];
  createdAt: string;
}
```

### Outfit Combination Object
```typescript
{
  top: ClothingItem;
  bottom: ClothingItem;
  footwear: ClothingItem;
  layer?: ClothingItem;
  compatibilityScore: number;  // 0-1
  colorScore: number;          // 0-1
  explanation: string;
  shoeRecommendation: string;
}
```

---

## 🤝 Contributing

This is a demonstration project showcasing full-stack development with AI-powered recommendations. Feel free to:
- Extend the color engine algorithms
- Add new clothing categories
- Implement additional ML models
- Improve the UI/UX
- Add more occasion types

---

## 📝 License

This project is for educational and demonstration purposes.

---

## 👨‍💻 Developer Notes

### Code Quality Standards
- ✅ Modular architecture with clear separation of concerns
- ✅ Reusable React components
- ✅ TypeScript for type safety
- ✅ Comprehensive error handling
- ✅ Detailed code comments
- ✅ Environment variable support
- ✅ RESTful API design

### Best Practices Implemented
- Component composition over inheritance
- Custom hooks for logic reuse
- Async/await for promises
- Proper loading and error states
- Optimistic UI updates
- Local storage for auth persistence

---

**Built with ❤️ for fashion-forward developers**

WardrobeAI - Making outfit decisions easier, one recommendation at a time! 👔✨
