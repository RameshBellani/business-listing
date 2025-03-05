'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/hooks/use-auth';
import { Header } from '../../components/layout/header';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from '../../hooks/use-toast';
import { AlertTriangle, Store, User } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'There was an error signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-1">
          <div className="flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-48 mt-4" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback className="text-2xl">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-2xl">{user.displayName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Account Information</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Email</span>
                          <span>{user.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Name</span>
                          <span>{user.displayName || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Account Created</span>
                          <span>{user.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-lg font-medium">Account Security</h3>
                      <div className="mt-4 space-y-4">
                        <Button variant="outline" className="w-full">
                          Change Password
                        </Button>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2" />
                            <div>
                              <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                                Account Deletion
                              </h4>
                              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                Deleting your account will remove all your listings and data.
                                This action cannot be undone.
                              </p>
                              <Button variant="destructive" size="sm" className="mt-2">
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="business" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Business Information</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Business Name</span>
                          <span>{user.businessName || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Business Type</span>
                          <span>Not set</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Contact Email</span>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
                        <Store className="mr-2 h-4 w-4" />
                        Go to Business Dashboard
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to Home
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}