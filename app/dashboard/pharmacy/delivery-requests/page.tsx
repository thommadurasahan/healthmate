'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Package, 
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface DeliveryRequest {
  id: string;
  orderId: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  urgencyLevel: string;
  expectedPickupTime: string;
  deliveryNotes: string;
  createdAt: string;
  deliveryPartner?: {
    name: string;
    phone: string;
  };
  order: {
    orderType: string;
    totalAmount: number;
    patient: {
      user: {
        name: string;
        phone: string;
      };
    };
  };
}

export default function DeliveryRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [formData, setFormData] = useState({
    orderId: '',
    pickupAddress: '',
    deliveryAddress: '',
    deliveryNotes: '',
    urgencyLevel: 'NORMAL',
    expectedPickupTime: '',
  });

  const urgencyOptions = [
    { value: 'NORMAL', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
    { value: 'EMERGENCY', label: 'Emergency', color: 'bg-red-100 text-red-800' },
  ];

  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'ASSIGNED', label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: Truck },
    { value: 'IN_TRANSIT', label: 'In Transit', color: 'bg-purple-100 text-purple-800', icon: Package },
    { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  ];

  // Fetch delivery requests
  const fetchDeliveryRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch('/api/deliveries');
      if (response.ok) {
        const data = await response.json();
        setDeliveryRequests(data);
      }
    } catch (error) {
      console.error('Error fetching delivery requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchDeliveryRequests();
  }, []);

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit delivery request');
      }

      setShowConfirmation(true);
      setFormData({
        orderId: '',
        pickupAddress: '',
        deliveryAddress: '',
        deliveryNotes: '',
        urgencyLevel: 'NORMAL',
        expectedPickupTime: '',
      });
      fetchDeliveryRequests(); // Refresh the list
    } catch (error) {
      console.error('Error submitting delivery request:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit delivery request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const urgencyOption = urgencyOptions.find(u => u.value === urgency);
    return urgencyOption?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Delivery Requests</h1>
          <p className="text-gray-600">Manage delivery requests for your pharmacy orders</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Create Delivery Request
            </CardTitle>
            <CardDescription>
              Submit a new delivery request for pickup and delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Order ID (Optional)</label>
                  <Input
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    placeholder="Enter order ID if applicable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Urgency Level</label>
                  <select
                    title="Select urgency level"
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {urgencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Address *</label>
                  <Input
                    required
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    placeholder="Enter pickup address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                  <Input
                    required
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder="Enter delivery address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expected Pickup Time *</label>
                <Input
                  required
                  type="datetime-local"
                  value={formData.expectedPickupTime}
                  onChange={(e) => setFormData({ ...formData, expectedPickupTime: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Notes</label>
                <textarea
                  value={formData.deliveryNotes}
                  onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                  placeholder="Add any special instructions or notes"
                  className="w-full p-2 border rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Delivery Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Delivery Requests
          </CardTitle>
          <CardDescription>
            View and track your delivery requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading delivery requests...
            </div>
          ) : deliveryRequests.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No delivery requests</h3>
              <p className="text-gray-600 mb-4">You haven't created any delivery requests yet.</p>
              <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveryRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">Request #{request.id.slice(-8)}</h3>
                      {request.orderId && (
                        <p className="text-sm text-gray-600">Order: {request.orderId}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge className={getUrgencyColor(request.urgencyLevel)}>
                        {request.urgencyLevel}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-gray-600">{request.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Delivery</p>
                        <p className="text-sm text-gray-600">{request.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Expected: {formatDate(request.expectedPickupTime)}
                    </div>
                    <div>Created: {formatDate(request.createdAt)}</div>
                  </div>

                  {request.deliveryNotes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm"><strong>Notes:</strong> {request.deliveryNotes}</p>
                    </div>
                  )}

                  {request.deliveryPartner && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm">
                        <strong>Delivery Partner:</strong> {request.deliveryPartner.name} 
                        <span className="ml-2">📞 {request.deliveryPartner.phone}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Delivery Request Submitted
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your delivery request has been successfully submitted. A delivery partner will be assigned shortly and you'll be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleConfirmationClose} className="bg-green-600 hover:bg-green-700">
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}