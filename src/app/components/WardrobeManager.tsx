/**
 * Wardrobe Management Component
 * Displays and manages clothing items
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ClothingItem, getWardrobe, deleteClothingItem, seedSampleData } from '../lib/api';

interface WardrobeManagerProps {
  onAddItem: () => void;
  onEditItem: (item: ClothingItem) => void;
  refreshTrigger?: number;
}

export function WardrobeManager({ onAddItem, onEditItem, refreshTrigger }: WardrobeManagerProps) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWardrobe = async () => {
    try {
      setLoading(true);
      const response = await getWardrobe();
      setItems(response.data || []);
    } catch (error: any) {
      toast.error('Failed to load wardrobe: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWardrobe();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteClothingItem(id);
      toast.success('Item deleted successfully');
      loadWardrobe();
    } catch (error: any) {
      toast.error('Failed to delete item: ' + error.message);
    }
  };

  const handleSeedData = async () => {
    try {
      const response = await seedSampleData();
      toast.success(response.message);
      loadWardrobe();
    } catch (error: any) {
      toast.error('Failed to seed data: ' + error.message);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Wardrobe</h2>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 && (
            <Button onClick={handleSeedData} variant="outline">
              Load Sample Items
            </Button>
          )}
          <Button onClick={onAddItem}>
            <Plus className="size-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-xl font-semibold mb-2">No Items Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your wardrobe to get outfit recommendations
            </p>
            <div className="flex gap-2">
              <Button onClick={onAddItem}>Add Your First Item</Button>
              <Button onClick={handleSeedData} variant="outline">
                Or Load Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {item.category.replace('_', ' ')}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{item.fit} fit</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditItem(item)}
                      className="size-8 p-0"
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id!)}
                      className="size-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="size-8 rounded-full border-2 border-border"
                    style={{ backgroundColor: item.primaryColor }}
                  />
                  <span className="text-sm font-medium">Primary Color</span>
                </div>

                {item.secondaryColor && (
                  <div className="flex items-center gap-2">
                    <div
                      className="size-8 rounded-full border-2 border-border"
                      style={{ backgroundColor: item.secondaryColor }}
                    />
                    <span className="text-sm font-medium">Secondary Color</span>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fabric</p>
                  <Badge variant="outline" className="capitalize">
                    {item.fabric}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Occasions</p>
                  <div className="flex flex-wrap gap-1">
                    {item.occasionTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="capitalize text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
