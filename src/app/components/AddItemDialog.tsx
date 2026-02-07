/**
 * Add/Edit Clothing Item Dialog
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { ClothingItem, addClothingItem, updateClothingItem } from '../lib/api';

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: ClothingItem | null;
}

const categories = [
  { value: 'shirt', label: 'Shirt' },
  { value: 'tshirt', label: 'T-Shirt' },
  { value: 'trousers', label: 'Trousers' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'blazer', label: 'Blazer' },
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'formal_shoes', label: 'Formal Shoes' },
  { value: 'boots', label: 'Boots' },
];

const fits = [
  { value: 'slim', label: 'Slim' },
  { value: 'regular', label: 'Regular' },
  { value: 'oversized', label: 'Oversized' },
];

const fabrics = [
  { value: 'cotton', label: 'Cotton' },
  { value: 'denim', label: 'Denim' },
  { value: 'wool', label: 'Wool' },
  { value: 'leather', label: 'Leather' },
  { value: 'synthetic', label: 'Synthetic' },
];

const occasions = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work' },
  { value: 'college', label: 'College' },
  { value: 'party', label: 'Party' },
  { value: 'travel', label: 'Travel' },
];

export function AddItemDialog({ open, onClose, onSuccess, editItem }: AddItemDialogProps) {
  const [formData, setFormData] = useState<Partial<ClothingItem>>({
    category: '',
    primaryColor: '#000000',
    secondaryColor: '',
    fit: '',
    fabric: '',
    occasionTags: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      setFormData({
        category: '',
        primaryColor: '#000000',
        secondaryColor: '',
        fit: '',
        fabric: '',
        occasionTags: [],
      });
    }
  }, [editItem, open]);

  const handleOccasionToggle = (occasion: string) => {
    const currentTags = formData.occasionTags || [];
    if (currentTags.includes(occasion)) {
      setFormData({
        ...formData,
        occasionTags: currentTags.filter((t) => t !== occasion),
      });
    } else {
      setFormData({
        ...formData,
        occasionTags: [...currentTags, occasion],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.primaryColor || !formData.fit || !formData.fabric) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.occasionTags || formData.occasionTags.length === 0) {
      toast.error('Please select at least one occasion');
      return;
    }

    setLoading(true);

    try {
      if (editItem?.id) {
        await updateClothingItem(editItem.id, formData);
        toast.success('Item updated successfully');
      } else {
        await addClothingItem(formData as ClothingItem);
        toast.success('Item added successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fit">Fit *</Label>
              <Select
                value={formData.fit}
                onValueChange={(value) => setFormData({ ...formData, fit: value })}
              >
                <SelectTrigger id="fit">
                  <SelectValue placeholder="Select fit" />
                </SelectTrigger>
                <SelectContent>
                  {fits.map((fit) => (
                    <SelectItem key={fit.value} value={fit.value}>
                      {fit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fabric">Fabric *</Label>
              <Select
                value={formData.fabric}
                onValueChange={(value) => setFormData({ ...formData, fabric: value })}
              >
                <SelectTrigger id="fabric">
                  <SelectValue placeholder="Select fabric" />
                </SelectTrigger>
                <SelectContent>
                  {fabrics.map((fabric) => (
                    <SelectItem key={fabric.value} value={fabric.value}>
                      {fabric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color *</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-20 h-10 p-1"
                />
                <Input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="secondaryColor">Secondary Color (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor || '#ffffff'}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-20 h-10 p-1"
                />
                <Input
                  type="text"
                  value={formData.secondaryColor || ''}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  placeholder="#ffffff (optional)"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Occasions * (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {occasions.map((occasion) => (
                <div key={occasion.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={occasion.value}
                    checked={formData.occasionTags?.includes(occasion.value)}
                    onCheckedChange={() => handleOccasionToggle(occasion.value)}
                  />
                  <Label
                    htmlFor={occasion.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {occasion.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
