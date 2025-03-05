'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '../../components/layout/header';
import { Sidebar } from '../../components/layout/sidebar';
import { SpecialOffers } from '../../components/layout/special-offers';
import { ListingCard, ListingCardSkeleton } from '../../components/listings/listing-card';
import { CreateListingButton } from '../../components/listings/create-listing-button';
import { useListings } from '../../lib/hooks/use-listings';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { FilterOptions, Listing } from '../../types';
import { Loader2, List, MapIcon } from 'lucide-react';

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function ExplorePage() {
  const { listings, loading, hasMore, fetchListings, fetchMoreListings } = useListings();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    
    const filterOptions: FilterOptions = {
      searchQuery,
    };
    
    if (categoryId) {
      filterOptions.category = categoryId;
    }
    
    fetchListings(filterOptions);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    const filterOptions: FilterOptions = {
      searchQuery: query,
    };
    
    if (selectedCategory) {
      filterOptions.category = selectedCategory;
    }
    
    fetchListings(filterOptions);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    
    const filterOptions: FilterOptions = {
      searchQuery,
    };
    
    if (selectedCategory) {
      filterOptions.category = selectedCategory;
    }
    
    await fetchMoreListings(filterOptions);
    setLoadingMore(false);
  };

  // Default map center (New York City)
  const defaultCenter = [40.7128, -74.0060] as [number, number];

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Explore Businesses</h1>
            <p className="text-muted-foreground mt-2">
              Discover businesses on the map or browse listings
            </p>
          </div>
          
          <Tabs defaultValue="list">
            <TabsList className="mb-6">
              <TabsTrigger value="list" className="flex items-center">
                <List className="mr-2 h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center">
                <MapIcon className="mr-2 h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <ListingCardSkeleton key={i} />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold mb-2">No listings found</h2>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? `No results found for "${searchQuery}"`
                      : selectedCategory
                      ? "No listings in this category yet"
                      : "No listings available at the moment"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div className="mt-8 flex justify-center">
                      <Button onClick={loadMore} disabled={loadingMore}>
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="map">
              {!isMounted ? (
                <Skeleton className="w-full h-[600px] rounded-md" />
              ) : (
                <>
                  <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                  />
                  <div className="h-[600px] w-full rounded-md overflow-hidden border">
                    <MapContainer
                      center={defaultCenter}
                      zoom={12}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {listings.map((listing) => {
                        // Use default coordinates if the listing doesn't have valid ones
                        const position = [
                          listing.location.coordinates.lat || (defaultCenter[0] + (Math.random() * 0.1 - 0.05)),
                          listing.location.coordinates.lng || (defaultCenter[1] + (Math.random() * 0.1 - 0.05))
                        ] as [number, number];
                        
                        return (
                          <Marker key={listing.id} position={position}>
                            <Popup>
                              <div className="p-1">
                                <h3 className="font-semibold">{listing.businessName}</h3>
                                <p className="text-sm">{listing.location.address}</p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto mt-1"
                                  onClick={() => window.location.href = `/listings/${listing.id}`}
                                >
                                  View Details
                                </Button>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        <SpecialOffers />
      </div>
      
      <CreateListingButton />
    </div>
  );
}