import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, FileText, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import VerificationBadge from '../components/VerificationBadge';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [bulkEnquiries, setBulkEnquiries] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verification form
  const [buyerType, setBuyerType] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [documentInfo, setDocumentInfo] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login?redirect=/dashboard');
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [ordersRes, enquiriesRes, verificationRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/bulk-enquiries/my-enquiries'),
        api.get('/verification/status'),
      ]);
      setOrders(ordersRes.data);
      setBulkEnquiries(enquiriesRes.data);
      setVerificationStatus(verificationRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/verification/submit', {
        buyer_type: buyerType,
        organization_name: organizationName,
        documents: {
          info: documentInfo,
        },
      });
      
      toast.success('Verification request submitted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to submit verification request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" data-testid="dashboard-title">
            My Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            <p className="text-slate-600">Welcome back, {user.name}</p>
            <VerificationBadge
              verification_status={user.verification_status}
              buyer_type={user.buyer_type}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" data-testid="orders-tab">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="bulk-enquiries" data-testid="bulk-enquiries-tab">
              <FileText className="h-4 w-4 mr-2" />
              Bulk Enquiries
            </TabsTrigger>
            <TabsTrigger value="verification" data-testid="verification-tab">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="profile-tab">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" data-testid="orders-content">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">My Orders</h2>
              {orders.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-slate-200 rounded-lg p-4" data-testid={`order-${order.id}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.payment_status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-200 pt-3 flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">₹{order.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Bulk Enquiries Tab */}
          <TabsContent value="bulk-enquiries" data-testid="bulk-enquiries-content">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">My Bulk Enquiries</h2>
              {bulkEnquiries.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No bulk enquiries yet</p>
              ) : (
                <div className="space-y-4">
                  {bulkEnquiries.map((enquiry) => (
                    <div key={enquiry.id} className="border border-slate-200 rounded-lg p-4" data-testid={`enquiry-${enquiry.id}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">{enquiry.product?.name}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(enquiry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          enquiry.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : enquiry.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {enquiry.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-slate-600">Organization:</span> {enquiry.organization_name}</p>
                        <p><span className="text-slate-600">Quantity:</span> {enquiry.quantity}</p>
                        <p><span className="text-slate-600">Buyer Type:</span> {enquiry.buyer_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" data-testid="verification-content">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Account Verification</h2>
              
              {user.verification_status === 'verified' ? (
                <div className="text-center py-8">
                  <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Account Verified</h3>
                  <p className="text-slate-600">Your account is verified as {user.buyer_type}</p>
                </div>
              ) : user.verification_status === 'pending' || verificationStatus?.status === 'pending' ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Verification Pending</h3>
                  <p className="text-slate-600">Your verification request is under review</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitVerification} className="max-w-md space-y-4">
                  <div>
                    <Label>Buyer Type *</Label>
                    <Select value={buyerType} onValueChange={setBuyerType} required>
                      <SelectTrigger data-testid="verification-buyer-type-select">
                        <SelectValue placeholder="Select buyer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                        <SelectItem value="Clinic">Clinic</SelectItem>
                        <SelectItem value="Doctor">Doctor</SelectItem>
                        <SelectItem value="Distributor">Distributor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Organization Name *</Label>
                    <Input
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      required
                      data-testid="verification-organization-input"
                    />
                  </div>
                  
                  <div>
                    <Label>Document Information *</Label>
                    <Input
                      value={documentInfo}
                      onChange={(e) => setDocumentInfo(e.target.value)}
                      placeholder="e.g., License number, Registration ID"
                      required
                      data-testid="verification-document-input"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" data-testid="submit-verification-button">
                    Submit Verification Request
                  </Button>
                </form>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" data-testid="profile-content">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Profile Information</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label>Name</Label>
                  <Input value={user.name} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email} disabled />
                </div>
                {user.phone && (
                  <div>
                    <Label>Phone</Label>
                    <Input value={user.phone} disabled />
                  </div>
                )}
                <div>
                  <Label>Account Type</Label>
                  <Input value={user.role} disabled />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;