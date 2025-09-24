'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DeliveryRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryNotes: '',
    urgencyLevel: 'normal',
    expectedPickupTime: '',
  });

  const urgencyOptions = [
    { value: 'normal', label: 'Normal', className: 'text-blue-600' },
    { value: 'urgent', label: 'Urgent', className: 'text-orange-600' },
    { value: 'emergency', label: 'Emergency', className: 'text-red-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/deliveries/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit delivery request');
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Error submitting delivery request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    router.refresh();
  };

  return (
    <div className="pharmacy-section p-6 bg-pharmacy-background min-h-screen">
      <h1 className="pharmacy-heading text-2xl font-semibold text-pharmacy-text mb-6">Create Delivery Request</h1>

      <Card className="pharmacy-card bg-white shadow-md border border-pharmacy-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-pharmacy-text">Pickup Address</label>
            <Input
              required
              value={formData.pickupAddress}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              placeholder="Enter pickup address"
              className="w-full bg-pharmacy-secondary border-pharmacy-border focus:border-pharmacy-primary focus:ring-pharmacy-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-pharmacy-text">Expected Pickup Time</label>
            <Input
              required
              type="datetime-local"
              value={formData.expectedPickupTime}
              onChange={(e) => setFormData({ ...formData, expectedPickupTime: e.target.value })}
              className="w-full bg-pharmacy-secondary border-pharmacy-border focus:border-pharmacy-primary focus:ring-pharmacy-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-pharmacy-text">Urgency Level</label>
            <select
              value={formData.urgencyLevel}
              onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
              className="w-full p-2 border rounded-md bg-pharmacy-secondary border-pharmacy-border focus:border-pharmacy-primary focus:ring-pharmacy-primary focus:outline-none"
            >
              {urgencyOptions.map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                  className={option.className}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-pharmacy-text">Delivery Notes</label>
            <textarea
              value={formData.deliveryNotes}
              onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
              placeholder="Add any special instructions or notes"
              className="w-full p-2 border rounded-md h-24 bg-pharmacy-secondary border-pharmacy-border focus:border-pharmacy-primary focus:ring-pharmacy-primary focus:outline-none resize-none"
            />
          </div>

          <Button 
            type="submit" 
            className="pharmacy-button w-full hover:opacity-90" 
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Delivery Request'}
          </Button>
        </form>
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-pharmacy-background border-pharmacy-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-pharmacy-text font-semibold">Delivery Request Submitted</AlertDialogTitle>
            <AlertDialogDescription className="text-pharmacy-text-light">
              Your delivery request has been successfully submitted. A delivery partner will be assigned shortly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={handleConfirmationClose}
              className="pharmacy-button hover:opacity-90"
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}