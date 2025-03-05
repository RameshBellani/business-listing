'use client';

import { useState } from 'react';
import { Header } from '../components/layout/header';
import { Sidebar } from '../components/layout/sidebar';
import { SpecialOffers } from '../components/layout/special-offers';
import { ListingCard, ListingCardSkeleton } from '../components/listings/listing-card';
import { CreateListingButton } from '../components/listings/create-listing-button';
import { useListings } from '../lib/hooks/use-listings';
import { Button } from '../components/ui/button';
import { FilterOptions } from '../types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { listings, loading, hasMore, fetchListings, fetchMoreListings } = useListings();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingMore, setLoadingMore] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Discover Local Businesses</h1>
            <p className="text-muted-foreground mt-2">
              Browse and connect with businesses in your area
            </p>
          </div>
          
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
        </main>
        
        <SpecialOffers />
      </div>
      
      <CreateListingButton />
    </div>
  );
}