'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/hooks/use-auth';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { ListingForm } from '../../components/listings/listing-form';
import { Plus } from 'lucide-react';

export function CreateListingButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Create Listing</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>
            Add your business to our directory. Fill out the form below to create a new listing.
          </DialogDescription>
        </DialogHeader>
        <ListingForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}