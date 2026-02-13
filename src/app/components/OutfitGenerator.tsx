/**
 * Outfit Generator Component
 * Generates and displays outfit recommendations
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Sparkles, Loader2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ClothingItem } from '../lib/api';

// Toast notifications helper
const toast = {
  success: (message: string) => console.log('✓', message),
  error: (message: string) => console.error('✗', message),
  info: (message: string) => console.info('ℹ', message),
};

const occasions = [
  { value: 'casual', label: 'Casual', icon: '👕' },
  { value: 'party', label: 'Party', icon: '🎉' },
  { value: 'formal', label: 'Formal', icon: '🤵' },
  { value: 'date', label: 'Date', icon: '💖' },
  { value: 'college', label: 'College', icon: '🎓' },
];

const skinTones = [
  { value: 'fair', label: 'Fair', icon: '🌤️' },
  { value: 'medium', label: 'Medium', icon: '🌅' },
  { value: 'olive', label: 'Olive', icon: '🫒' },
  { value: 'dark', label: 'Dark', icon: '🌑' },
];

const bodyTypes = [
  { value: 'slim', label: 'Slim', icon: '🧍' },
  { value: 'athletic', label: 'Athletic', icon: '🏃' },
  { value: 'muscular', label: 'Muscular', icon: '💪' },
  { value: 'plus', label: 'Plus', icon: '🫶' },
];

interface OutfitCombination {
  top: ClothingItem;
  bottom: ClothingItem;
  footwear: ClothingItem;
  layer?: ClothingItem;
  compatibilityScore: number;
  colorScore: number;
  explanation: string;
  shoeRecommendation: string;
}

export function OutfitGenerator() {
  const apiBase = (((import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000')).replace(/\/+$/, '');
  const [selectedSkinTone, setSelectedSkinTone] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [outfits, setOutfits] = useState<OutfitCombination[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!selectedSkinTone || !selectedBodyType || !selectedOccasion) {
      toast.error('Please select skin tone, body type, and occasion');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBase}/generate-outfit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skinTone: selectedSkinTone,
          bodyType: selectedBodyType,
          occasion: selectedOccasion,
          maxOutfits: 5,
        }),
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
        const message = data?.detail || data?.error || data?.message || 'Failed to generate outfits';
        throw new Error(message);
      }

      const results = data?.data || data?.outfits || data || [];
      setOutfits(results);
      setHasGenerated(true);

      if (Array.isArray(results) && results.length > 0) {
        toast.success(data?.message || 'Outfits generated!');
      } else {
        toast.info('No outfits found');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate outfits');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-blue-600 dark:text-blue-400';
    if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Acceptable';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      shirt: '👔',
      tshirt: '👕',
      trousers: '👖',
      jeans: '👖',
      blazer: '🧥',
      sneakers: '👟',
      formal_shoes: '👞',
      boots: '🥾',
    };
    return icons[category] || '👔';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Generate Outfits</h2>
        <p className="text-muted-foreground">
          Select an occasion to get AI-powered outfit recommendations
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row flex-wrap gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="skinTone">Skin Tone</Label>
              <Select value={selectedSkinTone} onValueChange={setSelectedSkinTone}>
                <SelectTrigger id="skinTone">
                  <SelectValue placeholder="Select skin tone" />
                </SelectTrigger>
                <SelectContent>
                  {skinTones.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      <span className="flex items-center gap-2">
                        <span>{tone.icon}</span>
                        <span>{tone.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="bodyType">Body Type</Label>
              <Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
                <SelectTrigger id="bodyType">
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="occasion">Select Occasion</Label>
              <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                <SelectTrigger id="occasion">
                  <SelectValue placeholder="Choose an occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map((occasion) => (
                    <SelectItem key={occasion.value} value={occasion.value}>
                      <span className="flex items-center gap-2">
                        <span>{occasion.icon}</span>
                        <span>{occasion.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedSkinTone || !selectedBodyType || !selectedOccasion}
                size="lg"
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Generate Outfits
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasGenerated && (
        <div>
          <h3 className="text-xl font-semibold mb-4">
            {outfits.length > 0
              ? `${outfits.length} Outfit${outfits.length !== 1 ? 's' : ''} Found`
              : 'No Outfits Found'}
          </h3>

          {outfits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-6xl mb-4">🤷</div>
                <h3 className="text-xl font-semibold mb-2">No Matching Outfits</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any suitable combinations for this occasion. Try adding more
                  items to your wardrobe or selecting a different occasion.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {outfits.map((outfit, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">Outfit #{index + 1}</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-2xl font-bold ${getScoreColor(
                                  outfit.compatibilityScore
                                )}`}
                              >
                                {Math.round(outfit.compatibilityScore * 100)}%
                              </span>
                              <Info className="size-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">
                              {getScoreLabel(outfit.compatibilityScore)} Match
                            </p>
                            <p className="text-sm">
                              Color Harmony: {Math.round(outfit.colorScore * 100)}%
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Top */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-3xl">{getCategoryIcon(outfit.top.category)}</span>
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {outfit.top.category.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {outfit.top.fit} • {outfit.top.fabric}
                        </p>
                      </div>
                      <div
                        className="size-10 rounded-full border-2 border-border"
                        style={{ backgroundColor: outfit.top.primaryColor }}
                      />
                    </div>

                    {/* Bottom */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-3xl">{getCategoryIcon(outfit.bottom.category)}</span>
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {outfit.bottom.category.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {outfit.bottom.fit} • {outfit.bottom.fabric}
                        </p>
                      </div>
                      <div
                        className="size-10 rounded-full border-2 border-border"
                        style={{ backgroundColor: outfit.bottom.primaryColor }}
                      />
                    </div>

                    {/* Footwear */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-3xl">
                        {getCategoryIcon(outfit.footwear.category)}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {outfit.footwear.category.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {outfit.footwear.fabric}
                        </p>
                      </div>
                      <div
                        className="size-10 rounded-full border-2 border-border"
                        style={{ backgroundColor: outfit.footwear.primaryColor }}
                      />
                    </div>

                    {/* Layer (if present) */}
                    {outfit.layer && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-3xl">{getCategoryIcon(outfit.layer.category)}</span>
                        <div className="flex-1">
                          <p className="font-medium capitalize">
                            {outfit.layer.category.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {outfit.layer.fit} • {outfit.layer.fabric}
                          </p>
                        </div>
                        <div
                          className="size-10 rounded-full border-2 border-border"
                          style={{ backgroundColor: outfit.layer.primaryColor }}
                        />
                      </div>
                    )}

                    {/* Explanation */}
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">
                          Why this works
                        </Badge>
                        <p className="text-sm text-muted-foreground flex-1">{outfit.explanation}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Footwear tip
                        </Badge>
                        <p className="text-sm text-muted-foreground flex-1">
                          {outfit.shoeRecommendation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
