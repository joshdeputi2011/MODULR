/**
 * Outfit Generation Engine
 * Generates outfit combinations based on wardrobe items and occasion
 */

import { calculateColorCompatibility, getShoeRecommendation } from "./color-engine.tsx";

export interface ClothingItem {
  id: string;
  userId: string;
  category: string;
  primaryColor: string;
  secondaryColor?: string;
  fit: string;
  fabric: string;
  occasionTags: string[];
  createdAt: string;
}

export interface OutfitCombination {
  top: ClothingItem;
  bottom: ClothingItem;
  footwear: ClothingItem;
  layer?: ClothingItem;
  compatibilityScore: number;
  colorScore: number;
  explanation: string;
  shoeRecommendation: string;
}

/**
 * Check if clothing item is suitable for occasion
 */
function isItemSuitableForOccasion(item: ClothingItem, occasion: string): boolean {
  // Convert occasion to lowercase for comparison
  const occasionLower = occasion.toLowerCase();
  return item.occasionTags.some(tag => tag.toLowerCase() === occasionLower);
}

/**
 * Get category type (top, bottom, footwear, layer)
 */
function getCategoryType(category: string): string {
  const tops = ["shirt", "tshirt"];
  const bottoms = ["trousers", "jeans"];
  const footwear = ["sneakers", "formal_shoes", "boots"];
  const layers = ["blazer"];

  if (tops.includes(category)) return "top";
  if (bottoms.includes(category)) return "bottom";
  if (footwear.includes(category)) return "footwear";
  if (layers.includes(category)) return "layer";

  return "unknown";
}

/**
 * Check if outfit meets formal requirements
 */
function meetsOccasionRequirements(
  top: ClothingItem,
  bottom: ClothingItem,
  footwear: ClothingItem,
  occasion: string
): boolean {
  const occasionLower = occasion.toLowerCase();

  // Formal occasion requirements
  if (occasionLower === "formal") {
    // Must have formal shoes
    if (footwear.category !== "formal_shoes") return false;
    // Prefer shirts over t-shirts
    if (top.category === "tshirt") return false;
    // Prefer trousers over jeans
    if (bottom.category === "jeans") return false;
  }

  // Work occasion requirements
  if (occasionLower === "work") {
    // Avoid casual footwear unless explicitly tagged for work
    if (footwear.category === "sneakers" && !footwear.occasionTags.includes("work")) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate fit compatibility score
 */
function calculateFitCompatibility(top: ClothingItem, bottom: ClothingItem): number {
  // Matching fits look cohesive
  if (top.fit === bottom.fit) return 0.3;

  // Slim top with regular bottom works well
  if (top.fit === "slim" && bottom.fit === "regular") return 0.25;

  // Regular top with slim bottom is acceptable
  if (top.fit === "regular" && bottom.fit === "slim") return 0.2;

  // Oversized combinations can work for casual
  if (top.fit === "oversized" || bottom.fit === "oversized") return 0.1;

  return 0.15; // Default compatibility
}

/**
 * Calculate fabric compatibility score
 */
function calculateFabricCompatibility(
  top: ClothingItem,
  bottom: ClothingItem,
  occasion: string
): number {
  const occasionLower = occasion.toLowerCase();

  // Formal: prefer wool, cotton
  if (occasionLower === "formal") {
    if (
      (top.fabric === "cotton" || top.fabric === "wool") &&
      (bottom.fabric === "wool" || bottom.fabric === "cotton")
    ) {
      return 0.25;
    }
  }

  // Casual: denim works well
  if (occasionLower === "casual" || occasionLower === "college") {
    if (bottom.fabric === "denim") return 0.2;
  }

  // Leather accents with formal fabrics
  if (top.fabric === "cotton" && bottom.fabric === "wool") return 0.2;

  return 0.15; // Default
}

/**
 * Generate outfit combinations from wardrobe items
 */
export function generateOutfits(
  items: ClothingItem[],
  occasion: string,
  maxOutfits = 10
): OutfitCombination[] {
  const outfits: OutfitCombination[] = [];

  // Categorize items
  const tops = items.filter(item => getCategoryType(item.category) === "top");
  const bottoms = items.filter(item => getCategoryType(item.category) === "bottom");
  const footwear = items.filter(item => getCategoryType(item.category) === "footwear");
  const layers = items.filter(item => getCategoryType(item.category) === "layer");

  // Generate combinations
  for (const top of tops) {
    // Skip if not suitable for occasion
    if (!isItemSuitableForOccasion(top, occasion)) continue;

    for (const bottom of bottoms) {
      if (!isItemSuitableForOccasion(bottom, occasion)) continue;

      for (const shoe of footwear) {
        if (!isItemSuitableForOccasion(shoe, occasion)) continue;

        // Check basic requirements
        if (!meetsOccasionRequirements(top, bottom, shoe, occasion)) continue;

        // Calculate color compatibility
        const colorResult = calculateColorCompatibility(
          top.primaryColor,
          bottom.primaryColor,
          shoe.primaryColor,
          occasion
        );

        // Calculate fit compatibility
        const fitScore = calculateFitCompatibility(top, bottom);

        // Calculate fabric compatibility
        const fabricScore = calculateFabricCompatibility(top, bottom, occasion);

        // Calculate overall compatibility score
        const compatibilityScore =
          colorResult.score * 0.5 + fitScore + fabricScore;

        // Get shoe recommendation
        const shoeRecommendation = getShoeRecommendation(
          top.primaryColor,
          bottom.primaryColor,
          occasion
        );

        // Optional layer (blazer for formal/work)
        let layer: ClothingItem | undefined;
        if (occasion.toLowerCase() === "formal" || occasion.toLowerCase() === "work") {
          layer = layers.find(l => isItemSuitableForOccasion(l, occasion));
        }

        outfits.push({
          top,
          bottom,
          footwear: shoe,
          layer,
          compatibilityScore,
          colorScore: colorResult.score,
          explanation: colorResult.explanation,
          shoeRecommendation,
        });
      }
    }
  }

  // Sort by compatibility score (descending)
  outfits.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Return top N outfits
  return outfits.slice(0, maxOutfits);
}

/**
 * Generate ML-style features for outfit (for future ML integration)
 */
export function extractOutfitFeatures(outfit: {
  top: ClothingItem;
  bottom: ClothingItem;
  footwear: ClothingItem;
}): Record<string, number> {
  // This function prepares data for ML model training/inference
  // Currently returns structured features that could be used by a real ML model

  return {
    top_hue: 0, // Would extract from primaryColor
    top_saturation: 0,
    top_value: 0,
    bottom_hue: 0,
    bottom_saturation: 0,
    bottom_value: 0,
    shoe_hue: 0,
    shoe_saturation: 0,
    shoe_value: 0,
    fit_match: outfit.top.fit === outfit.bottom.fit ? 1 : 0,
    occasion_formal: 0,
    occasion_casual: 0,
  };
}
