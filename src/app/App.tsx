/**
 * MODULR - Main Application
 * AI-powered outfit recommendation system
 */

import { useState, useEffect } from 'react';
import { ThemeProvider } from './providers';
import { Toaster } from './components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { AuthForm } from './components/AuthForm';
import { WardrobeManager } from './components/WardrobeManager';
import { AddItemDialog } from './components/AddItemDialog';
import { OutfitGenerator } from './components/OutfitGenerator';
import { isAuthenticated, logout, getUserData, ClothingItem } from './lib/api';
import { Sparkles, User, LogOut, Shirt } from 'lucide-react';

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('wardrobe');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<ClothingItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    if (authenticated) {
      setCurrentUser(getUserData());
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setCurrentUser(getUserData());
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('wardrobe');
  };

  const handleAddItem = () => {
    setEditItem(null);
    setShowAddDialog(true);
  };

  const handleEditItem = (item: ClothingItem) => {
    setEditItem(item);
    setShowAddDialog(true);
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setEditItem(null);
  };

  const handleItemSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
          <Toaster />
          <div className="w-full max-w-6xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="size-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="size-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MODULR
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AI-powered outfit recommendations from your existing wardrobe. Build perfect
                combinations based on occasion and color harmony.
              </p>
            </div>

            <div className="flex justify-center">
              <AuthForm
                mode={authMode}
                onSuccess={handleAuthSuccess}
                onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-4xl mb-3">👔</div>
                <h3 className="font-semibold mb-2">Smart Wardrobe</h3>
                <p className="text-sm text-muted-foreground">
                  Organize your clothing items with detailed attributes
                </p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-semibold mb-2">Color Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced color theory for perfect combinations
                </p>
              </div>
              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="font-semibold mb-2">AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized outfit suggestions for any occasion
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Toaster />

        {/* Header */}
        <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    MODULR
                  </h1>
                  <p className="text-xs text-muted-foreground">Smart Outfit Recommendations</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <User className="size-4" />
                  <span className="text-sm font-medium">{currentUser?.name}</span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="wardrobe" className="flex items-center gap-2">
                <Shirt className="size-4" />
                My Wardrobe
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Generate Outfits
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wardrobe" className="space-y-6">
              <WardrobeManager
                onAddItem={handleAddItem}
                onEditItem={handleEditItem}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              <OutfitGenerator />
            </TabsContent>
          </Tabs>
        </main>

        {/* Add/Edit Item Dialog */}
        <AddItemDialog
          open={showAddDialog}
          onClose={handleDialogClose}
          onSuccess={handleItemSaved}
          editItem={editItem}
        />

        {/* Footer */}
        <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>
              Built with Next.js, TypeScript, Tailwind CSS, and AI-powered color intelligence
            </p>
            <p className="mt-1">
              MODULR - Your personal fashion assistant 👔✨
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}