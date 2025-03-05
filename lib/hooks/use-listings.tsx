'use client';

import { useState, useEffect } from 'react';
import { setDoc } from 'firebase/firestore';

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Listing, FilterOptions } from '../../types';

export const useListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchListings = async (filterOptions?: FilterOptions, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      let q = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      // if (filterOptions?.category) {
      //   q = query(q, where('category', '==', filterOptions.category));
      // }
      
      // if (filterOptions?.location) {
      //   q = query(q, where('location.address', '==', filterOptions.location));
      // }

      const constraints = [];

if (filterOptions?.category) {
  constraints.push(where('category', '==', filterOptions.category));
}

if (filterOptions?.location) {
  constraints.push(where('location.address', '==', filterOptions.location));
}

q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), ...constraints, limit(pageSize));

      
      // Note: Full-text search would require a more complex solution like Algolia
      // This is a simplified approach
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setListings([]);
        setHasMore(false);
      } else {
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        const listingsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Listing;
        });
        
        // If search query is provided, filter results client-side
        // (Not ideal for large datasets, but works for demo purposes)
        const filteredListings = filterOptions?.searchQuery 
          ? listingsData.filter(listing => 
              listing.businessName.toLowerCase().includes(filterOptions.searchQuery?.toLowerCase() || '') ||
              listing.description.toLowerCase().includes(filterOptions.searchQuery?.toLowerCase() || '')
            )
          : listingsData;
          
        setListings(filteredListings);
        setHasMore(querySnapshot.docs.length === pageSize);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreListings = async (filterOptions?: FilterOptions, pageSize = 10) => {
    if (!lastVisible) return;
    
    try {
      setLoading(true);
      
      let q = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(pageSize)
      );
      
      if (filterOptions?.category) {
        q = query(q, where('category', '==', filterOptions.category));
      }
      
      if (filterOptions?.location) {
        q = query(q, where('location.address', '==', filterOptions.location));
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
      } else {
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        const newListings = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Listing;
        });
        
        // If search query is provided, filter results client-side
        const filteredNewListings = filterOptions?.searchQuery 
          ? newListings.filter(listing => 
              listing.businessName.toLowerCase().includes(filterOptions.searchQuery?.toLowerCase() || '') ||
              listing.description.toLowerCase().includes(filterOptions.searchQuery?.toLowerCase() || '')
            )
          : newListings;
          
        setListings(prev => [...prev, ...filteredNewListings]);
        setHasMore(querySnapshot.docs.length === pageSize);
      }
    } catch (err) {
      console.error('Error fetching more listings:', err);
      setError('Failed to fetch more listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // const fetchSpecialOffers = async (limit = 5) => {
  //   try {
  //     const q = query(
  //       collection(db, 'listings'),
  //       where('isSpecialOffer', '==', true),
  //       orderBy('createdAt', 'desc'),
  //       limit
  //     );
      
  //     const querySnapshot = await getDocs(q);
      
  //     const specialOffersData = querySnapshot.docs.map(doc => {
  //       const data = doc.data();
  //       return {
  //         id: doc.id,
  //         ...data,
  //         createdAt: data.createdAt?.toDate() || new Date(),
  //         updatedAt: data.updatedAt?.toDate() || new Date(),
  //       } as Listing;
  //     });
      
  //     setSpecialOffers(specialOffersData);
  //   } catch (err) {
  //     console.error('Error fetching special offers:', err);
  //   }
  // };

  const fetchSpecialOffers = async (limitValue = 5) => {
    try {
      const q = query(
        collection(db, 'listings'),
        where('isSpecialOffer', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitValue) // Ensure you use limit() function correctly
      );
  
      const querySnapshot = await getDocs(q);
  
      const specialOffersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Listing;
      });
  
      setSpecialOffers(specialOffersData);
    } catch (err) {
      console.error('Error fetching special offers:', err);
    }
  };
  
  const fetchListingById = async (id: string): Promise<Listing | null> => {
    try {
      const docRef = doc(db, 'listings', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Listing;
      } else {
        return null;
      }
    } catch (err) {
      console.error('Error fetching listing by ID:', err);
      throw err;
    }
  };

  const fetchListingsByOwnerId = async (ownerId: string): Promise<Listing[]> => {
    try {
      const q = query(
        collection(db, 'listings'),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Listing;
      });
    } catch (err) {
      console.error('Error fetching listings by owner ID:', err);
      throw err;
    }
  };

  const createListing = async (
    listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'saves'>, 
    imageFiles: File[]
  ): Promise<string> => {
    try {
      // Upload images to Firebase Storage
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const storageRef = ref(storage, `listings/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );
      
      // Create listing document in Firestore
      const listingWithImages = {
        ...listingData,
        images: imageUrls,
        likes: 0,
        saves: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'listings'), listingWithImages);
      return docRef.id;
    } catch (err) {
      console.error('Error creating listing:', err);
      throw err;
    }
  };

  const updateListing = async (
    id: string, 
    listingData: Partial<Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>>,
    newImageFiles?: File[]
  ): Promise<void> => {
    try {
      // Upload new images if provided
      let imageUrls: string[] = [];
      
      if (newImageFiles && newImageFiles.length > 0) {
        imageUrls = await Promise.all(
          newImageFiles.map(async (file) => {
            const storageRef = ref(storage, `listings/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
          })
        );
      }
      
      // Get current listing to merge with existing images
      const currentListing = await fetchListingById(id);
      
      // Update listing document in Firestore
      const updateData = {
        ...listingData,
        updatedAt: serverTimestamp(),
      };
      
      // If new images were uploaded, append them to existing images
      if (imageUrls.length > 0) {
        updateData.images = [...(currentListing?.images || []), ...imageUrls];
      }
      
      await updateDoc(doc(db, 'listings', id), updateData);
    } catch (err) {
      console.error('Error updating listing:', err);
      throw err;
    }
  };

  const deleteListing = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch (err) {
      console.error('Error deleting listing:', err);
      throw err;
    }
  };

  const toggleLike = async (listingId: string, userId: string): Promise<void> => {
    try {
      // Check if user has already interacted with this listing
      const interactionRef = doc(db, 'userInteractions', `${userId}_${listingId}`);
      const interactionSnap = await getDoc(interactionRef);
      
      const listingRef = doc(db, 'listings', listingId);
      const listingSnap = await getDoc(listingRef);
      
      if (!listingSnap.exists()) {
        throw new Error('Listing not found');
      }
      
      const currentLikes = listingSnap.data().likes || 0;
      
      if (interactionSnap.exists()) {
        const data = interactionSnap.data();
        
        // Toggle like status
        await updateDoc(interactionRef, {
          liked: !data.liked,
          updatedAt: serverTimestamp(),
        });
        
        // Update listing like count
        await updateDoc(listingRef, {
          likes: data.liked ? currentLikes - 1 : currentLikes + 1,
        });
      } else {
        // Create new interaction
        await setDoc(interactionRef, {
          userId,
          listingId,
          liked: true,
          saved: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        // Increment listing like count
        await updateDoc(listingRef, {
          likes: currentLikes + 1,
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      throw err;
    }
  };

  const toggleSave = async (listingId: string, userId: string): Promise<void> => {
    try {
      // Check if user has already interacted with this listing
      const interactionRef = doc(db, 'userInteractions', `${userId}_${listingId}`);
      const interactionSnap = await getDoc(interactionRef);
      
      const listingRef = doc(db, 'listings', listingId);
      const listingSnap = await getDoc(listingRef);
      
      if (!listingSnap.exists()) {
        throw new Error('Listing not found');
      }
      
      const currentSaves = listingSnap.data().saves || 0;
      
      if (interactionSnap.exists()) {
        const data = interactionSnap.data();
        
        // Toggle save status
        await updateDoc(interactionRef, {
          saved: !data.saved,
          updatedAt: serverTimestamp(),
        });
        
        // Update listing save count
        await updateDoc(listingRef, {
          saves: data.saved ? currentSaves - 1 : currentSaves + 1,
        });
      } else {
        // Create new interaction
        await setDoc(interactionRef, {
          userId,
          listingId,
          liked: false,
          saved: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        // Increment listing save count
        await updateDoc(listingRef, {
          saves: currentSaves + 1,
        });
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      throw err;
    }
  };

  const getUserInteraction = async (listingId: string, userId: string) => {
    try {
      const interactionRef = doc(db, 'userInteractions', `${userId}_${listingId}`);
      const interactionSnap = await getDoc(interactionRef);
      
      if (interactionSnap.exists()) {
        return {
          liked: interactionSnap.data().liked || false,
          saved: interactionSnap.data().saved || false,
        };
      } else {
        return {
          liked: false,
          saved: false,
        };
      }
    } catch (err) {
      console.error('Error getting user interaction:', err);
      return {
        liked: false,
        saved: false,
      };
    }
  };

  useEffect(() => {
    fetchListings();
    fetchSpecialOffers();
  }, []);

  return {
    listings,
    specialOffers,
    loading,
    error,
    hasMore,
    fetchListings,
    fetchMoreListings,
    fetchSpecialOffers,
    fetchListingById,
    fetchListingsByOwnerId,
    createListing,
    updateListing,
    deleteListing,
    toggleLike,
    toggleSave,
    getUserInteraction,
  };
};