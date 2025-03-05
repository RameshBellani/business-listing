import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  businessName?: string;
  createdAt: Date | Timestamp;  // Allow both Date and Firestore Timestamp
}

export interface Listing {
  id: string;
  ownerId: string;
  ownerName: string;
  businessName: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  description: string;
  images: string[];
  offersDelivery: boolean;
  isSpecialOffer: boolean;
  likes: number;
  saves: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface UserInteraction {
  userId: string;
  listingId: string;
  liked: boolean;
  saved: boolean;
  createdAt: Date;
}

export type FilterOptions = {
  category?: string;
  location?: string;
  searchQuery?: string;
};