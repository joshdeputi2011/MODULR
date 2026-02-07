/**
 * Color Harmony Engine
 * Implements color theory rules for outfit compatibility
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

/**
 * Convert HEX color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff === 0) h = 0;
  else if (max === r) h = ((g - b) / diff) % 6;
  else if (max === g) h = (b - r) / diff + 2;
  else h = (r - g) / diff + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (diff / max) * 100;
  const v = max * 100;

  return { h, s, v };
}

/**
 * Convert HEX to HSV
 */
export function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex));
}

/**
 * Check if color is neutral (black, white, grey, beige, navy)
 */
export function isNeutral(hsv: HSV): boolean {
  // Low saturation colors
  if (hsv.s < 20) return true;

  // Navy (hue around 210-240, medium saturation)
  if (hsv.h >= 210 && hsv.h <= 240 && hsv.s < 60) return true;

  // Beige/tan (hue around 30-50, low saturation)
  if (hsv.h >= 30 && hsv.h <= 50 && hsv.s < 40) return true;

  return false;
}

/**
 * Calculate color contrast (for formal vs casual)
 */
export function calculateContrast(hsv1: HSV, hsv2: HSV): number {
  const valueDiff = Math.abs(hsv1.v - hsv2.v);
  const saturationDiff = Math.abs(hsv1.s - hsv2.s);
  return (valueDiff + saturationDiff) / 200; // Normalize to 0-1
}

/**
 * Check if colors are complementary (opposite on color wheel)
 */
export function areComplementary(hsv1: HSV, hsv2: HSV): boolean {
  const hueDiff = Math.abs(hsv1.h - hsv2.h);
  return (hueDiff >= 150 && hueDiff <= 210) || (hueDiff >= 330 || hueDiff <= 30);
}

/**
 * Check if colors are analogous (adjacent on color wheel)
 */
export function areAnalogous(hsv1: HSV, hsv2: HSV): boolean {
  const hueDiff = Math.abs(hsv1.h - hsv2.h);
  return hueDiff <= 60;
}

/**
 * Calculate color compatibility score
 */
export function calculateColorCompatibility(
  topColor: string,
  bottomColor: string,
  shoeColor: string,
  occasion: string
): { score: number; explanation: string } {
  const topHsv = hexToHsv(topColor);
  const bottomHsv = hexToHsv(bottomColor);
  const shoeHsv = hexToHsv(shoeColor);

  let score = 0.5; // Base score
  const reasons: string[] = [];

  // Rule 1: Neutral colors are always safe
  const topNeutral = isNeutral(topHsv);
  const bottomNeutral = isNeutral(bottomHsv);
  const shoeNeutral = isNeutral(shoeHsv);

  if (topNeutral && bottomNeutral && shoeNeutral) {
    score += 0.3;
    reasons.push("All neutral colors create a sophisticated look");
  } else if ((topNeutral || bottomNeutral) && shoeNeutral) {
    score += 0.2;
    reasons.push("Neutral shoes balance the outfit");
  }

  // Rule 2: Dark top with light bottom
  if (topHsv.v < 40 && bottomHsv.v > 60) {
    score += 0.15;
    reasons.push("Dark top with light bottom creates visual balance");
  }

  // Rule 3: Light top with dark bottom
  if (topHsv.v > 60 && bottomHsv.v < 40) {
    score += 0.1;
    reasons.push("Light top with dark bottom is a classic combination");
  }

  // Rule 4: Complementary colors (bold but can work)
  if (areComplementary(topHsv, bottomHsv)) {
    if (occasion === "casual" || occasion === "party") {
      score += 0.1;
      reasons.push("Complementary colors add visual interest");
    } else {
      score -= 0.1;
      reasons.push("Complementary colors may be too bold for this occasion");
    }
  }

  // Rule 5: Analogous colors (harmonious)
  if (areAnalogous(topHsv, bottomHsv) && !topNeutral && !bottomNeutral) {
    score += 0.15;
    reasons.push("Analogous colors create harmony");
  }

  // Rule 6: Occasion-specific contrast rules
  const contrast = calculateContrast(topHsv, bottomHsv);

  if (occasion === "formal" || occasion === "work") {
    if (contrast < 0.3) {
      score += 0.15;
      reasons.push("Low contrast is appropriate for formal settings");
    } else if (contrast > 0.6) {
      score -= 0.1;
      reasons.push("High contrast may be too casual for this occasion");
    }
  } else if (occasion === "casual" || occasion === "college" || occasion === "party") {
    if (contrast > 0.4 && contrast < 0.7) {
      score += 0.1;
      reasons.push("Good contrast adds visual appeal");
    }
  }

  // Rule 7: Bold top needs neutral footwear
  if (topHsv.s > 60 && topHsv.v > 50 && shoeNeutral) {
    score += 0.1;
    reasons.push("Neutral footwear balances the bold top");
  }

  // Rule 8: All bold colors (risky)
  if (topHsv.s > 60 && bottomHsv.s > 60 && shoeHsv.s > 60) {
    score -= 0.2;
    reasons.push("Too many bold colors can be overwhelming");
  }

  // Rule 9: Monochromatic (same hue, different values)
  if (
    Math.abs(topHsv.h - bottomHsv.h) < 30 &&
    Math.abs(topHsv.v - bottomHsv.v) > 20 &&
    !topNeutral
  ) {
    score += 0.15;
    reasons.push("Monochromatic palette creates cohesion");
  }

  // Normalize score to 0-1 range
  score = Math.max(0, Math.min(1, score));

  return {
    score,
    explanation: reasons.join(". ") || "Standard color combination",
  };
}

/**
 * Get shoe recommendations based on outfit colors and occasion
 */
export function getShoeRecommendation(
  topColor: string,
  bottomColor: string,
  occasion: string
): string {
  const topHsv = hexToHsv(topColor);
  const bottomHsv = hexToHsv(bottomColor);

  // Formal occasions: always recommend neutral leather shoes
  if (occasion === "formal" || occasion === "work") {
    if (bottomHsv.v < 30) {
      return "Black leather shoes for formal elegance";
    } else if (bottomHsv.h >= 20 && bottomHsv.h <= 40) {
      return "Brown leather shoes complement earth tones";
    } else {
      return "Dark leather shoes maintain professionalism";
    }
  }

  // Casual/College: sneakers preferred
  if (occasion === "casual" || occasion === "college") {
    if (isNeutral(topHsv) && isNeutral(bottomHsv)) {
      return "White sneakers add a fresh touch";
    } else if (topHsv.s > 60 || bottomHsv.s > 60) {
      return "Neutral sneakers balance bold colors";
    } else {
      return "Casual sneakers complete the look";
    }
  }

  // Party: flexible
  if (occasion === "party") {
    if (topHsv.v < 40 && bottomHsv.v < 40) {
      return "Bold sneakers or boots add personality";
    } else {
      return "Statement footwear to stand out";
    }
  }

  return "Versatile neutral footwear";
}
