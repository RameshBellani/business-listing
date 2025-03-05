'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '../../lib/hooks/use-categories';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Skeleton } from '../../components/ui/skeleton';
import { Category } from '../../types';
import { 
  Store, 
  Coffee, 
  ShoppingBag, 
  Utensils, 
  Home, 
  Car, 
  Briefcase, 
  Heart, 
  Scissors, 
  Shirt 
} from 'lucide-react';

interface SidebarProps {
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'restaurants': <Utensils className="h-4 w-4" />,
  'cafes': <Coffee className="h-4 w-4" />,
  'retail': <ShoppingBag className="h-4 w-4" />,
  'real-estate': <Home className="h-4 w-4" />,
  'automotive': <Car className="h-4 w-4" />,
  'professional-services': <Briefcase className="h-4 w-4" />,
  'health-beauty': <Heart className="h-4 w-4" />,
  'salons': <Scissors className="h-4 w-4" />,
  'fashion': <Shirt className="h-4 w-4" />,
};

export function Sidebar({ onCategorySelect, selectedCategory }: SidebarProps) {
  const { categories, loading } = useCategories();
  
  const getIconForCategory = (category: Category) => {
    return categoryIcons[category.id] || <Store className="h-4 w-4" />;
  };

  return (
    <div className="w-full md:w-64 flex-shrink-0 border-r">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <Button 
          variant={selectedCategory === null ? "default" : "ghost"} 
          className="w-full justify-start mb-2"
          onClick={() => onCategorySelect(null)}
        >
          <Store className="mr-2 h-4 w-4" />
          All Businesses
        </Button>
        
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-1 pr-4">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-2 py-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : (
              categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onCategorySelect(category.id)}
                >
                  {getIconForCategory(category)}
                  <span className="ml-2">{category.name}</span>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}