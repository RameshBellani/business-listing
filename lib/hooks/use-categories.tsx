'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Category } from '../../types';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'restaurants', name: 'Restaurants' },
  { id: 'cafes', name: 'Cafes' },
  { id: 'retail', name: 'Retail' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'professional-services', name: 'Professional Services' },
  { id: 'health-beauty', name: 'Health & Beauty' },
  { id: 'salons', name: 'Salons' },
  { id: 'fashion', name: 'Fashion' },
];

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeDefaultCategories = async () => {
    try {
      // Create all default categories in Firestore
      await Promise.all(
        DEFAULT_CATEGORIES.map(async (category) => {
          const categoryRef = doc(db, 'categories', category.id);
          await setDoc(categoryRef, { name: category.name });
        })
      );
      return DEFAULT_CATEGORIES;
    } catch (err) {
      console.error('Error initializing categories:', err);
      return DEFAULT_CATEGORIES; // Return defaults even if Firestore fails
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const querySnapshot = await getDocs(collection(db, 'categories'));
      
      if (querySnapshot.empty) {
        const defaultCats = await initializeDefaultCategories();
        setCategories(defaultCats);
      } else {
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }) as Category);
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories(DEFAULT_CATEGORIES); // Fallback to defaults
      setError('Failed to fetch categories. Using default categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
  };
};