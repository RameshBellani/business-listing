'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/hooks/use-auth';
import { seedCategories, seedSampleListings } from '../../lib/seed-data';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from '../../hooks/use-toast';
import { Database, Loader2, Sprout } from 'lucide-react';

export default function SeedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSeedingCategories, setIsSeedingCategories] = useState(false);
  const [isSeedingListings, setIsSeedingListings] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  const handleSeedCategories = async () => {
    try {
      setIsSeedingCategories(true);
      await seedCategories();
      toast({
        title: 'Categories seeded',
        description: 'Categories have been successfully added to the database.',
      });
    } catch (error) {
      console.error('Error seeding categories:', error);
      toast({
        title: 'Error',
        description: 'There was an error seeding categories. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSeedingCategories(false);
    }
  };

  const handleSeedListings = async () => {
    if (!user) return;
    
    try {
      setIsSeedingListings(true);
      await seedSampleListings(user.uid, user.displayName || 'Business Owner');
      toast({
        title: 'Sample listings seeded',
        description: 'Sample listings have been successfully added to the database.',
      });
    } catch (error) {
      console.error('Error seeding listings:', error);
      toast({
        title: 'Error',
        description: 'There was an error seeding sample listings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSeedingListings(false);
    }
  };

  if (authLoading || !user) {
    return null; // Will redirect to signin or show loading
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Database className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Seed Database</CardTitle>
          <CardDescription className="text-center">
            Populate your database with sample data for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 p-4 rounded-md">
            <h3 className="font-medium flex items-center">
              <Sprout className="h-4 w-4 mr-2" />
              Seed Categories
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Add business categories to the database. This is required before adding listings.
            </p>
            <Button 
              onClick={handleSeedCategories} 
              disabled={isSeedingCategories}
              className="w-full"
            >
              {isSeedingCategories ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Categories...
                </>
              ) : (
                'Seed Categories'
              )}
            </Button>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-md">
            <h3 className="font-medium flex items-center">
              <Sprout className="h-4 w-4 mr-2" />
              Seed Sample Listings
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Add sample business listings to your account for testing purposes.
            </p>
            <Button 
              onClick={handleSeedListings} 
              disabled={isSeedingListings}
              className="w-full"
            >
              {isSeedingListings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Listings...
                </>
              ) : (
                'Seed Sample Listings'
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}