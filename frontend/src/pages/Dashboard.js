import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, FileText, ShieldCheck, User, Download, LayoutDashboard, Truck, MapPin, Clock, CheckCircle, XCircle, Box, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import VerificationBadge from '../components/VerificationBadge';
import { getMedicalAvatar } from '../utils/avatars';
import { FullPageLoader } from '../components/MedicalLoader';

// Order status configuration
const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Box },
  packed: { label: 'Packed', color: 'bg-indigo-100 text-indigo-700', icon: PackageCheck },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
};

// Payment status configuration
const PAYMENT_STATUSES = {
  completed: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: '✓' },
  pay_on_delivery: { label: 'Pay on Delivery', color: 'bg-orange-100 text-orange-700', icon: '💵' },
  awaiting_confirmation: { label: 'Awaiting Confirmation', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  emi_pending: { label: 'EMI Processing', color: 'bg-blue-100 text-blue-700', icon: '📋' },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: '⏳' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: '✗' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700', icon: '↩' }
};

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

  const downloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded!');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  // Show loading while auth is being checked or user is null
  if (authLoading || !user) {
    return <FullPageLoader text="Loading dashboard..." />;
  }

  if (loading) {
    return <FullPageLoader text="Loading your data..." />;
  }

  return (
    <div className="min-h-screen bg-purple-50" data-testid="dashboard-page">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
              <LayoutDashboard className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" data-testid="dashboard-title">
              My <span className="text-purple-600">Dashboard</span>
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-gray-500">Welcome back, {user.name}</p>
              <VerificationBadge
                verification_status={user.verification_status}
                buyer_type={user.buyer_type}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-purple-100 rounded-xl p-1 shadow-sm">
              <TabsTrigger value="orders" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600 rounded-lg" data-testid="orders-tab">
                <Package className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-enquiries" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600 rounded-lg" data-testid="bulk-enquiries-tab">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bulk</span>
              </TabsTrigger>
              <TabsTrigger value="verification" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600 rounded-lg" data-testid="verification-tab">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Verify</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600 rounded-lg" data-testid="profile-tab">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" data-testid="orders-content">
              <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = ORDER_STATUSES[order.order_status] || ORDER_STATUSES.pending;
                      const paymentStatus = PAYMENT_STATUSES[order.payment_status] || PAYMENT_STATUSES.pending;
                      const StatusIcon = status.icon;
                      return (
                        <div key={order.id} className="bg-purple-50 border border-purple-100 rounded-xl p-4" data-testid={`order-${order.id}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString('en-IN', { 
                                  day: 'numeric', month: 'short', year: 'numeric' 
                                })}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                via {order.payment_method === 'cod' ? 'Cash on Delivery' : 
                                    order.payment_method === 'razorpay' ? 'Card/NetBanking' :
                                    order.payment_method === 'upi' ? 'UPI' :
                                    order.payment_method === 'bank_transfer' ? 'Bank Transfer' :
                                    order.payment_method === 'pay_later' ? 'Pay Later' : order.payment_method}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${paymentStatus.color}`}>
                                <span>{paymentStatus.icon}</span>
                                {paymentStatus.label}
                              </span>
                            </div>
                          </div>
                          
                          {/* Payment Instructions for pending payments */}
                          {order.payment_status === 'awaiting_confirmation' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-xs">
                              <p className="font-semibold text-yellow-800">⏳ Bank Transfer Pending</p>
                              <p className="text-yellow-700 mt-1">Please transfer ₹{order.total_amount.toLocaleString()} to our bank account. Your order will be processed once we confirm the payment.</p>
                            </div>
                          )}
                          
                          {order.payment_status === 'pay_on_delivery' && order.order_status !== 'delivered' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 text-xs">
                              <p className="font-semibold text-orange-800">💵 Cash on Delivery</p>
                              <p className="text-orange-700 mt-1">Please keep ₹{order.total_amount.toLocaleString()} ready. Pay when you receive your order.</p>
                            </div>
                          )}
                          
                          {/* Order Items */}
                          <div className="space-y-2 mb-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm text-gray-600">
                                <span>{item.product_name} x {item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Tracking Info */}
                          {(order.tracking_number || order.courier_name || order.estimated_delivery) && (
                            <div className="bg-white rounded-lg p-3 mb-3 border border-purple-100">
                              <p className="text-xs font-semibold text-purple-600 mb-2 flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Tracking Information
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {order.courier_name && (
                                  <div>
                                    <span className="text-gray-500">Courier:</span>
                                    <span className="ml-1 font-medium">{order.courier_name}</span>
                                  </div>
                                )}
                                {order.tracking_number && (
                                  <div>
                                    <span className="text-gray-500">Tracking #:</span>
                                    <span className="ml-1 font-medium text-purple-600">{order.tracking_number}</span>
                                  </div>
                                )}
                                {order.estimated_delivery && (
                                  <div className="col-span-2">
                                    <span className="text-gray-500">Expected Delivery:</span>
                                    <span className="ml-1 font-medium text-green-600">{order.estimated_delivery}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Delivery Address */}
                          {order.delivery_address && (
                            <div className="text-xs text-gray-500 mb-3 flex items-start gap-1">
                              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>
                                {order.delivery_address.address}, {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
                              </span>
                            </div>
                          )}
                          
                          <div className="border-t border-purple-200 pt-3 flex justify-between items-center">
                            <div className="font-semibold text-gray-900">
                              <span>Total: </span>
                              <span className="text-purple-600">₹{order.total_amount.toLocaleString()}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadInvoice(order.id)}
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                              data-testid={`download-invoice-${order.id}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Invoice
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Bulk Enquiries Tab */}
            <TabsContent value="bulk-enquiries" data-testid="bulk-enquiries-content">
              <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Bulk Enquiries</h2>
                {bulkEnquiries.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bulk enquiries yet</p>
                ) : (
                  <div className="space-y-4">
                    {bulkEnquiries.map((enquiry) => (
                      <div key={enquiry.id} className="bg-purple-50 border border-purple-100 rounded-xl p-4" data-testid={`enquiry-${enquiry.id}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{enquiry.product?.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(enquiry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            enquiry.status === 'pending'
                              ? 'bg-blue-100 text-blue-700'
                              : enquiry.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {enquiry.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="text-gray-500">Organization:</span> {enquiry.organization_name}</p>
                          <p><span className="text-gray-500">Quantity:</span> {enquiry.quantity}</p>
                          <p><span className="text-gray-500">Buyer Type:</span> {enquiry.buyer_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" data-testid="verification-content">
              <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Verification</h2>
                
                {user.verification_status === 'verified' ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Verified</h3>
                    <p className="text-gray-500">Your account is verified as {user.buyer_type}</p>
                  </div>
                ) : user.verification_status === 'pending' || verificationStatus?.status === 'pending' ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Pending</h3>
                    <p className="text-gray-500">Your verification request is under review</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitVerification} className="max-w-md space-y-4">
                    <div>
                      <Label className="text-gray-700">Buyer Type *</Label>
                      <Select value={buyerType} onValueChange={setBuyerType} required>
                        <SelectTrigger className="mt-2 border-gray-200 focus:border-purple-500" data-testid="verification-buyer-type-select">
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
                      <Label className="text-gray-700">Organization Name *</Label>
                      <Input
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                        className="mt-2 border-gray-200 focus:border-purple-500"
                        data-testid="verification-organization-input"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-700">Document Information *</Label>
                      <Input
                        value={documentInfo}
                        onChange={(e) => setDocumentInfo(e.target.value)}
                        placeholder="e.g., License number, Registration ID"
                        required
                        className="mt-2 border-gray-200 focus:border-purple-500"
                        data-testid="verification-document-input"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" data-testid="submit-verification-button">
                      Submit Verification Request
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" data-testid="profile-content">
              <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label className="text-gray-500">Name</Label>
                    <Input value={user.name} disabled className="mt-2 bg-gray-50 border-gray-200 text-gray-900" />
                  </div>
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <Input value={user.email} disabled className="mt-2 bg-gray-50 border-gray-200 text-gray-900" />
                  </div>
                  {user.phone && (
                    <div>
                      <Label className="text-gray-500">Phone</Label>
                      <Input value={user.phone} disabled className="mt-2 bg-gray-50 border-gray-200 text-gray-900" />
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <Input value={user.role} disabled className="mt-2 bg-gray-50 border-gray-200 text-gray-900" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
