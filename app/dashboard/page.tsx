'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/hooks/use-auth';
import { useListings } from '../../lib/hooks/use-listings';
import { Header } from '../../components/layout/header';
import { CreateListingButton } from '../../components/listings/create-listing-button';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Listing } from '../../types';
import { 
  Edit, 
  Eye, 
  Heart, 
  Bookmark, 
  Truck, 
  Trash2, 
  AlertTriangle,
  BarChart3,
  ListFilter,
  MapPin
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { ListingForm } from '../../components/listings/listing-form';
import { toast } from '../../hooks/use-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { fetchListingsByOwnerId, deleteListing } = useListings();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch listings when user is available
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    fetchListingsByOwnerId(user.uid)
      .then((fetchedListings) => setListings(fetchedListings))
      .catch((error) => console.error('Error fetching listings:', error))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading]);

  if (authLoading || loading) return <p>Loading...</p>;

  return (
    <div>
      <Header />
      <h1>Dashboard</h1>
      <CreateListingButton />

      {listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div>
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <CardTitle>{listing.ownerName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{listing.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
