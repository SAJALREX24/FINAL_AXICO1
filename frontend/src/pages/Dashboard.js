import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, FileText, ShieldCheck, User, Download, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import VerificationBadge from '../components/VerificationBadge';
import { getMedicalAvatar } from '../utils/avatars';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto"></div>
          <p className="mt-4 text-purple-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="dashboard-page">
      {/* Purple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20">
              <LayoutDashboard className="h-8 w-8 text-teal-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" data-testid="dashboard-title">
              My <span className="text-teal-400">Dashboard</span>
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-purple-200">Welcome back, {user.name}</p>
              <VerificationBadge
                verification_status={user.verification_status}
                buyer_type={user.buyer_type}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1">
              <TabsTrigger value="orders" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white rounded-lg" data-testid="orders-tab">
                <Package className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-enquiries" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white rounded-lg" data-testid="bulk-enquiries-tab">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bulk</span>
              </TabsTrigger>
              <TabsTrigger value="verification" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white rounded-lg" data-testid="verification-tab">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Verify</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white text-white rounded-lg" data-testid="profile-tab">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" data-testid="orders-content">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">My Orders</h2>
                {orders.length === 0 ? (
                  <p className="text-purple-200 text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white/10 border border-white/20 rounded-xl p-4" data-testid={`order-${order.id}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-white">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-purple-200">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.payment_status === 'completed' 
                              ? 'bg-teal-500/20 text-teal-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-purple-200">
                              <span>{item.product_name} x {item.quantity}</span>
                              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                          <div className="font-semibold text-white">
                            <span>Total: </span>
                            <span className="text-teal-400">₹{order.total_amount.toLocaleString()}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadInvoice(order.id)}
                            className="border-white/30 text-white hover:bg-white/10"
                            data-testid={`download-invoice-${order.id}`}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Bulk Enquiries Tab */}
            <TabsContent value="bulk-enquiries" data-testid="bulk-enquiries-content">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">My Bulk Enquiries</h2>
                {bulkEnquiries.length === 0 ? (
                  <p className="text-purple-200 text-center py-8">No bulk enquiries yet</p>
                ) : (
                  <div className="space-y-4">
                    {bulkEnquiries.map((enquiry) => (
                      <div key={enquiry.id} className="bg-white/10 border border-white/20 rounded-xl p-4" data-testid={`enquiry-${enquiry.id}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-white">{enquiry.product?.name}</p>
                            <p className="text-sm text-purple-200">
                              {new Date(enquiry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            enquiry.status === 'pending'
                              ? 'bg-blue-500/20 text-blue-300'
                              : enquiry.status === 'approved'
                              ? 'bg-teal-500/20 text-teal-300'
                              : 'bg-white/20 text-white'
                          }`}>
                            {enquiry.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-purple-200">
                          <p><span className="text-purple-300">Organization:</span> {enquiry.organization_name}</p>
                          <p><span className="text-purple-300">Quantity:</span> {enquiry.quantity}</p>
                          <p><span className="text-purple-300">Buyer Type:</span> {enquiry.buyer_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" data-testid="verification-content">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Account Verification</h2>
                
                {user.verification_status === 'verified' ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Account Verified</h3>
                    <p className="text-purple-200">Your account is verified as {user.buyer_type}</p>
                  </div>
                ) : user.verification_status === 'pending' || verificationStatus?.status === 'pending' ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-white mb-2">Verification Pending</h3>
                    <p className="text-purple-200">Your verification request is under review</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitVerification} className="max-w-md space-y-4">
                    <div>
                      <Label className="text-white">Buyer Type *</Label>
                      <Select value={buyerType} onValueChange={setBuyerType} required>
                        <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white" data-testid="verification-buyer-type-select">
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
                      <Label className="text-white">Organization Name *</Label>
                      <Input
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                        className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        data-testid="verification-organization-input"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white">Document Information *</Label>
                      <Input
                        value={documentInfo}
                        onChange={(e) => setDocumentInfo(e.target.value)}
                        placeholder="e.g., License number, Registration ID"
                        required
                        className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        data-testid="verification-document-input"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600" data-testid="submit-verification-button">
                      Submit Verification Request
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" data-testid="profile-content">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label className="text-purple-200">Name</Label>
                    <Input value={user.name} disabled className="mt-2 bg-white/10 border-white/20 text-white" />
                  </div>
                  <div>
                    <Label className="text-purple-200">Email</Label>
                    <Input value={user.email} disabled className="mt-2 bg-white/10 border-white/20 text-white" />
                  </div>
                  {user.phone && (
                    <div>
                      <Label className="text-purple-200">Phone</Label>
                      <Input value={user.phone} disabled className="mt-2 bg-white/10 border-white/20 text-white" />
                    </div>
                  )}
                  <div>
                    <Label className="text-purple-200">Account Type</Label>
                    <Input value={user.role} disabled className="mt-2 bg-white/10 border-white/20 text-white" />
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
