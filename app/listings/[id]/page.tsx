'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/use-auth';
import { useListings } from '../../../lib/hooks/use-listings';
import { Header } from '../../../components/layout/header';
import { ListingMap } from '../../../components/listings/listing-map';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { AspectRatio } from '../../../components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { ListingForm } from '../../../components/listings/listing-form';
import { Listing } from '../../../types';
import { 
  ArrowLeft, 
  Calendar, 
  Heart, 
  Bookmark, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Truck, 
  Edit, 
  Trash2,
  AlertTriangle
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
} from '../../../components/ui/alert-dialog';
import { toast } from '../../../hooks/use-toast';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { fetchListingById, toggleLike, toggleSave, getUserInteraction, deleteListing } = useListings();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [interaction, setInteraction] = useState({ liked: false, saved: false });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const listingData = await fetchListingById(id as string);
        setListing(listingData);
        
        if (listingData && user) {
          const userInteraction = await getUserInteraction(listingData.id, user.uid);
          setInteraction(userInteraction);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !listing) return;
    
    try {
      await toggleLike(listing.id, user.uid);
      setInteraction(prev => ({ ...prev, liked: !prev.liked }));
      
      // Update the listing like count in the UI
      setListing(prev => {
        if (!prev) return null;
        return {
          ...prev,
          likes: prev.likes + (interaction.liked ? -1 : 1),
        };
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    if (!user || !listing) return;
    
    try {
      await toggleSave(listing.id, user.uid);
      setInteraction(prev => ({ ...prev, saved: !prev.saved }));
      
      // Update the listing save count in the UI
      setListing(prev => {
        if (!prev) return null;
        return {
          ...prev,
          saves: prev.saves + (interaction.saved ? -1 : 1),
        };
      });
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    
    try {
      await deleteListing(listing.id);
      toast({
        title: 'Listing deleted',
        description: 'Your listing has been deleted successfully.',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting your listing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    // Refresh the listing data
    fetchListingById(id as string).then(setListing);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-lg" />
              <div className="mt-6">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-64 w-full rounded-lg mb-6" />
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Listing Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The listing you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user && user.uid === listing.ownerId;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{listing.businessName}</h1>
            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{listing.location.address}</span>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex gap-2 mt-4 md:mt-0">
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Listing</DialogTitle>
                    <DialogDescription>
                      Update your business listing information.
                    </DialogDescription>
                  </DialogHeader>
                  <ListingForm listing={listing} onSuccess={handleEditSuccess} />
                </DialogContent>
              </Dialog>
              
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      listing and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center">
                          {listing.ownerName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">{listing.ownerName}</h3>
                          <p className="text-sm text-muted-foreground">Business Owner</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLike}
                            disabled={!user}
                          >
                            <Heart
                              className={`h-5 w-5 ${interaction.liked ? 'fill-red-500 text-red-500' : ''}`}
                            />
                          </Button>
                          <span className="text-xs text-muted-foreground">{listing.likes}</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSave}
                            disabled={!user}
                          >
                            <Bookmark
                              className={`h-5 w-5 ${interaction.saved ? 'fill-primary text-primary' : ''}`}
                            />
                          </Button>
                          <span className="text-xs text-muted-foreground">{listing.saves}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">About</h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {listing.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {listing.offersDelivery && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            <span>Delivery Available</span>
                          </Badge>
                        )}
                        
                        {listing.isSpecialOffer && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Special Offer
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{listing.location.address}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Contact phone would go here</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Contact email would go here</span>
                          </div>
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Website would go here</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Business hours would go here</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="photos">
                <Card>
                  <CardContent className="p-6">
                    {listing.images.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No photos available</p>
                      </div>
                    ) : (
                      <>
                        <Dialog>
                          <DialogContent className="max-w-4xl p-0 overflow-hidden">
                            {selectedImage && (
                              <div className="relative">
                                <img
                                  src={selectedImage}
                                  alt={listing.businessName}
                                  className="w-full h-auto max-h-[80vh] object-contain"
                                />
                              </div>
                            )}
                          </DialogContent>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {listing.images.map((image, index) => (
                              <DialogTrigger key={index} asChild>
                                <div
                                  className="cursor-pointer"
                                  onClick={() => setSelectedImage(image)}
                                >
                                  <AspectRatio ratio={4 / 3} className="bg-muted rounded-md overflow-hidden">
                                    <img
                                      src={image}
                                      alt={`${listing.businessName} - Image ${index + 1}`}
                                      className="object-cover w-full h-full"
                                    />
                                  </AspectRatio>
                                </div>
                              </DialogTrigger>
                            ))}
                          </div>
                        </Dialog>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardContent className="p-0">
                <ListingMap listing={listing} height="250px" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuesday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wednesday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thursday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 3:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}