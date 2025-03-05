'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useListings } from '../../lib/hooks/use-listings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { MapPin, Star } from 'lucide-react';

export function SpecialOffers() {
  const { specialOffers, loading, fetchSpecialOffers } = useListings();

  useEffect(() => {
    fetchSpecialOffers();
  }, []);

  if (loading) {
    return (
      <div className="w-full md:w-72 lg:w-80 flex-shrink-0 border-l p-4">
        <h2 className="text-lg font-semibold mb-4">Special Offers</h2>
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-32 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-72 lg:w-80 flex-shrink-0 border-l">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Star className="mr-2 h-5 w-5 text-yellow-500" />
          Special Offers
        </h2>
        
        {specialOffers.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              No special offers available at the moment.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {specialOffers.map((offer) => (
              <Link href={`/listings/${offer.id}`} key={offer.id}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">{offer.businessName}</CardTitle>
                    <CardDescription className="flex items-center text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {offer.location.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {offer.images.length > 0 && (
                      <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                        <img
                          src={offer.images[0]}
                          alt={offer.businessName}
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                    )}
                    <p className="mt-2 text-sm line-clamp-2">{offer.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Special Offer
                    </Badge>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}