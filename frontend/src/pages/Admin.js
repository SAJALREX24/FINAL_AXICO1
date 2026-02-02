import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Package, ShoppingCart, FileText, Star, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bulkEnquiries, setBulkEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  
  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    specifications: {},
    availability: true,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes, enquiriesRes, reviewsRes, verificationsRes] = await Promise.all([
        api.get('/products'),
        api.get('/admin/orders'),
        api.get('/admin/bulk-enquiries'),
        api.get('/admin/reviews'),
        api.get('/admin/verifications'),
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setBulkEnquiries(enquiriesRes.data);
      setReviews(reviewsRes.data);
      setVerifications(verificationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', {
        ...productForm,
        price: parseFloat(productForm.price),
      });
      toast.success('Product created successfully!');
      setProductDialogOpen(false);
      fetchData();
      setProductForm({
        name: '',
        description: '',
        category: '',
        price: '',
        image: '',
        specifications: {},
        availability: true,
      });
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/admin/products/${productId}`);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleApproveReview = async (reviewId, approved) => {
    try {
      await api.put(`/admin/reviews/${reviewId}`, { approved });
      toast.success(approved ? 'Review approved' : 'Review rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleVerificationAction = async (verificationId, status) => {
    try {
      await api.put(`/admin/verifications/${verificationId}`, { status });
      toast.success(`Verification ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update verification');
    }
  };

  const handleEnquiryStatus = async (enquiryId, status) => {
    try {
      await api.put(`/admin/bulk-enquiries/${enquiryId}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
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
    <div className="min-h-screen py-8" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8" data-testid="admin-title">
          Admin Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6" data-testid="stat-products">
            <Package className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold text-slate-900">{products.length}</p>
            <p className="text-slate-600">Products</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6" data-testid="stat-orders">
            <ShoppingCart className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
            <p className="text-slate-600">Orders</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6" data-testid="stat-enquiries">
            <FileText className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900">{bulkEnquiries.length}</p>
            <p className="text-slate-600">Bulk Enquiries</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6" data-testid="stat-verifications">
            <ShieldCheck className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900">{verifications.filter(v => v.status === 'pending').length}</p>
            <p className="text-slate-600">Pending Verifications</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products" data-testid="admin-products-tab">Products</TabsTrigger>
            <TabsTrigger value="orders" data-testid="admin-orders-tab">Orders</TabsTrigger>
            <TabsTrigger value="enquiries" data-testid="admin-enquiries-tab">Bulk Enquiries</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="admin-reviews-tab">Reviews</TabsTrigger>
            <TabsTrigger value="verifications" data-testid="admin-verifications-tab">Verifications</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Products Management</h2>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="add-product-button">Add Product</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                      <div>
                        <Label>Product Name *</Label>
                        <Input
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                          data-testid="product-name-input"
                        />
                      </div>
                      <div>
                        <Label>Description *</Label>
                        <Textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          required
                          rows={3}
                          data-testid="product-description-input"
                        />
                      </div>
                      <div>
                        <Label>Category *</Label>
                        <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })} required>
                          <SelectTrigger data-testid="product-category-select">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Diagnostic Equipment">Diagnostic Equipment</SelectItem>
                            <SelectItem value="Hospital Furniture">Hospital Furniture</SelectItem>
                            <SelectItem value="Surgical Instruments">Surgical Instruments</SelectItem>
                            <SelectItem value="Patient Monitoring">Patient Monitoring</SelectItem>
                            <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Price *</Label>
                        <Input
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                          data-testid="product-price-input"
                        />
                      </div>
                      <div>
                        <Label>Image URL *</Label>
                        <Input
                          value={productForm.image}
                          onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                          required
                          data-testid="product-image-input"
                        />
                      </div>
                      <Button type="submit" className="w-full" data-testid="submit-product-button">
                        Create Product
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 font-semibold text-slate-900">Product</th>
                      <th className="pb-3 font-semibold text-slate-900">Category</th>
                      <th className="pb-3 font-semibold text-slate-900">Price</th>
                      <th className="pb-3 font-semibold text-slate-900">Status</th>
                      <th className="pb-3 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-slate-100" data-testid={`admin-product-${product.id}`}>
                        <td className="py-3">{product.name}</td>
                        <td className="py-3">{product.category}</td>
                        <td className="py-3">₹{product.price.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${product.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.availability ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`delete-product-${product.id}`}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Orders Management</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-slate-200 rounded-lg p-4" data-testid={`admin-order-${order.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-primary">Total: ₹{order.total_amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Bulk Enquiries Tab */}
          <TabsContent value="enquiries">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Bulk Enquiries Management</h2>
              <div className="space-y-4">
                {bulkEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="border border-slate-200 rounded-lg p-4" data-testid={`admin-enquiry-${enquiry.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{enquiry.product?.name}</p>
                        <p className="text-sm text-slate-600">{enquiry.organization_name} - {enquiry.buyer_type}</p>
                        <p className="text-sm text-slate-600">Quantity: {enquiry.quantity}</p>
                      </div>
                      <Select value={enquiry.status} onValueChange={(v) => handleEnquiryStatus(enquiry.id, v)}>
                        <SelectTrigger className="w-32" data-testid={`enquiry-status-${enquiry.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Reviews Management</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-slate-200 rounded-lg p-4" data-testid={`admin-review-${review.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{review.user?.name}</p>
                        <p className="text-sm text-slate-600">{review.product?.name}</p>
                        <p className="text-sm mt-2">{review.comment}</p>
                      </div>
                      <div className="flex space-x-2">
                        {!review.approved && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveReview(review.id, true)}
                              data-testid={`approve-review-${review.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproveReview(review.id, false)}
                              data-testid={`reject-review-${review.id}`}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {review.approved && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Approved</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Verification Requests</h2>
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <div key={verification.id} className="border border-slate-200 rounded-lg p-4" data-testid={`admin-verification-${verification.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{verification.user?.name}</p>
                        <p className="text-sm text-slate-600">{verification.organization_name} - {verification.buyer_type}</p>
                        <p className="text-sm text-slate-600">Document: {verification.documents?.info}</p>
                      </div>
                      {verification.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerificationAction(verification.id, 'approved')}
                            data-testid={`approve-verification-${verification.id}`}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVerificationAction(verification.id, 'rejected')}
                            data-testid={`reject-verification-${verification.id}`}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {verification.status !== 'pending' && (
                        <span className={`px-3 py-1 rounded text-sm ${verification.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {verification.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
