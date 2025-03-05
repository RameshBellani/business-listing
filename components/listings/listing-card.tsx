'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/hooks/use-auth';
import { useListings } from '../../lib/hooks/use-listings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Listing } from '../../types';
import { Heart, MapPin, Bookmark, Truck } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();
  const { toggleLike, toggleSave, getUserInteraction } = useListings();
  const [interaction, setInteraction] = useState({ liked: false, saved: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInteraction = async () => {
      if (user) {
        setIsLoading(true);
        const userInteraction = await getUserInteraction(listing.id, user.uid);
        setInteraction(userInteraction);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    fetchInteraction();
  }, [listing.id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to sign in or show a toast notification
      return;
    }
    
    try {
      await toggleLike(listing.id, user.uid);
      setInteraction(prev => ({ ...prev, liked: !prev.liked }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to sign in or show a toast notification
      return;
    }
    
    try {
      await toggleSave(listing.id, user.uid);
      setInteraction(prev => ({ ...prev, saved: !prev.saved }));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{listing.businessName}</CardTitle>
              <CardDescription className="flex items-center text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {listing.location.address}
              </CardDescription>
            </div>
            {listing.offersDelivery && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                <span className="text-xs">Delivery</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {listing.images.length > 0 && (
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
              <img
                src={listing.images[0]}
                alt={listing.businessName}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          )}
          <p className="mt-2 text-sm line-clamp-2">{listing.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleLike}
              disabled={isLoading}
            >
              <Heart
                className={`h-4 w-4 ${interaction.liked ? 'fill-red-500 text-red-500' : ''}`}
              />
              <span className="sr-only">Like</span>
            </Button>
            <span className="text-sm text-muted-foreground">{listing.likes}</span>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Bookmark
                className={`h-4 w-4 ${interaction.saved ? 'fill-primary text-primary' : ''}`}
              />
              <span className="sr-only">Save</span>
            </Button>
            <span className="text-sm text-muted-foreground">{listing.saves}</span>
          </div>
          
          {listing.isSpecialOffer && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Special Offer
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-8 w-8 rounded-full ml-2" />
          <Skeleton className="h-4 w-4" />
        </div>
        <Skeleton className="h-5 w-20" />
      </CardFooter>
    </Card>
  );
}