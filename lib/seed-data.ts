'use client';

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category } from '../types';

// Categories data
const categoriesData: Omit<Category, 'id'>[] = [
  { name: 'Restaurants', icon: 'utensils' },
  { name: 'Cafes', icon: 'coffee' },
  { name: 'Retail', icon: 'shopping-bag' },
  { name: 'Real Estate', icon: 'home' },
  { name: 'Automotive', icon: 'car' },
  { name: 'Professional Services', icon: 'briefcase' },
  { name: 'Health & Beauty', icon: 'heart' },
  { name: 'Salons', icon: 'scissors' },
  { name: 'Fashion', icon: 'shirt' },
];

// Function to seed categories
export const seedCategories = async () => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));

    if (categoriesSnapshot.empty) {
      console.log('Seeding categories...');
      for (const category of categoriesData) {
        await addDoc(collection(db, 'categories'), {
          name: category.name,
          icon: category.icon,
        });
      }
      console.log('Categories seeded successfully!');
    } else {
      console.log('Categories already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Function to seed sample listings
export const seedSampleListings = async (ownerId: string, ownerName: string) => {
  try {
    const listingsSnapshot = await getDocs(
      query(collection(db, 'listings'), where('ownerId', '==', ownerId))
    );

    if (!listingsSnapshot.empty) {
      console.log('Sample listings already exist for this owner, skipping seed.');
      return;
    }

    console.log('Seeding sample listings...');

    // Get categories from Firestore
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];

    if (categories.length === 0) {
      console.warn('No categories found. Seeding categories first...');
      await seedCategories();
    }

    // Sample listings
    const sampleListings = [
      {
        ownerId,
        ownerName,
        businessName: 'Delicious Bites',
        location: {
          address: '123 Main St, New York, NY',
          coordinates: { lat: 40.7128, lng: -74.0060 },
        },
        category: categories.find(c => c.name === 'Restaurants')?.id || categories[0].id,
        description:
          'A cozy restaurant serving delicious homemade meals with fresh, locally-sourced ingredients. Our menu changes seasonally to offer the best flavors year-round.',
        images: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
        ],
      },
      {
        ownerId,
        ownerName,
        businessName: 'The Coffee Spot',
        location: {
          address: '456 Elm St, Los Angeles, CA',
          coordinates: { lat: 34.0522, lng: -118.2437 },
        },
        category: categories.find(c => c.name === 'Cafes')?.id || categories[0].id,
        description:
          'A welcoming café offering a wide selection of freshly brewed coffee, artisanal pastries, and a cozy environment for work or relaxation.',
        images: [
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixid=M3wxMjA3fDB8MHxhbXA=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
        ],
      },
    ];

    // Add sample listings to Firestore
    for (const listing of sampleListings) {
      await addDoc(collection(db, 'listings'), listing);
    }

    console.log('Sample listings seeded successfully!');
  } catch (error) {
    console.error('Error seeding sample listings:', error);
  }
};
