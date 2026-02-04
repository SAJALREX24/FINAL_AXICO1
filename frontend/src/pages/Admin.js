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
import { Package, ShoppingCart, FileText, Star, ShieldCheck, Users, Plus, Percent, Box, Tag, BarChart3, Download, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '../components/ui/switch';
import SalesDashboard from '../components/SalesDashboard';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bulkEnquiries, setBulkEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Track which product is being edited
  
  // Default empty form state
  const defaultProductForm = {
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    discount: '',
    image: '',
    images: '',
    stockQuantity: '',
    minOrderQuantity: '1',
    specifications: {},
    keyFeatures: '',
    featureHighlights: [
      { icon: 'zap', title: '', description: '' },
      { icon: 'shield', title: '', description: '' },
      { icon: 'timer', title: '', description: '' },
      { icon: 'award', title: '', description: '' },
    ],
    warrantyInfo: '',
    shippingInfo: '',
    availability: true,
    featured: false,
    limitedStock: false,
  };
  
  // Enhanced Product form with more fields
  const [productForm, setProductForm] = useState(defaultProductForm);
    availability: true,
    featured: false,
    limitedStock: false,
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

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
      // Parse images from comma-separated string
      const imagesArray = productForm.images 
        ? productForm.images.split(',').map(url => url.trim()).filter(url => url)
        : [];
      
      // Parse key features from comma-separated string
      const keyFeaturesArray = productForm.keyFeatures 
        ? productForm.keyFeatures.split(',').map(f => f.trim()).filter(f => f)
        : ['Premium Quality', 'ISO Certified', 'Easy to Use', '1 Year Warranty'];
      
      // Filter out empty feature highlights
      const featureHighlightsArray = productForm.featureHighlights
        .filter(fh => fh.title && fh.description)
        .map(fh => ({ icon: fh.icon, title: fh.title, description: fh.description }));

      const productData = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: parseFloat(productForm.price),
        original_price: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        image: productForm.image,
        images: imagesArray.length > 0 ? imagesArray : null,
        key_features: keyFeaturesArray,
        feature_highlights: featureHighlightsArray.length > 0 ? featureHighlightsArray : null,
        warranty_info: productForm.warrantyInfo || null,
        shipping_info: productForm.shippingInfo || null,
        availability: productForm.availability,
        specifications: {
          ...productForm.specifications,
          ...(productForm.stockQuantity && { stockQuantity: parseInt(productForm.stockQuantity) }),
          ...(productForm.minOrderQuantity && { minOrderQuantity: parseInt(productForm.minOrderQuantity) }),
          featured: productForm.featured,
          limitedStock: productForm.limitedStock,
        },
      };
      
      if (editingProduct) {
        // Update existing product
        await api.put(`/admin/products/${editingProduct.id}`, productData);
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        await api.post('/admin/products', productData);
        toast.success('Product created successfully!');
      }
      
      setProductDialogOpen(false);
      setEditingProduct(null);
      fetchData();
      setProductForm(defaultProductForm);
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  // Open edit dialog with product data
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    
    // Parse feature highlights from product
    const featureHighlights = product.feature_highlights && product.feature_highlights.length > 0
      ? [
          ...product.feature_highlights,
          ...Array(4 - product.feature_highlights.length).fill({ icon: 'zap', title: '', description: '' })
        ].slice(0, 4)
      : [
          { icon: 'zap', title: '', description: '' },
          { icon: 'shield', title: '', description: '' },
          { icon: 'timer', title: '', description: '' },
          { icon: 'award', title: '', description: '' },
        ];
    
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price?.toString() || '',
      originalPrice: product.original_price?.toString() || '',
      discount: '',
      image: product.image || '',
      images: product.images?.join(', ') || '',
      stockQuantity: product.specifications?.stockQuantity?.toString() || '',
      minOrderQuantity: product.specifications?.minOrderQuantity?.toString() || '1',
      specifications: product.specifications || {},
      keyFeatures: product.key_features?.join(', ') || '',
      featureHighlights: featureHighlights,
      warrantyInfo: product.warranty_info || '',
      shippingInfo: product.shipping_info || '',
      availability: product.availability ?? true,
      featured: product.specifications?.featured ?? false,
      limitedStock: product.specifications?.limitedStock ?? false,
    });
    
    setProductDialogOpen(true);
  };

  // Close dialog and reset form
  const handleCloseDialog = () => {
    setProductDialogOpen(false);
    setEditingProduct(null);
    setProductForm(defaultProductForm);
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
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 py-8" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="admin-title">
          Admin <span className="text-purple-600">Dashboard</span>
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm" data-testid="stat-products">
            <Package className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            <p className="text-gray-500">Products</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm" data-testid="stat-orders">
            <ShoppingCart className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            <p className="text-gray-500">Orders</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm" data-testid="stat-enquiries">
            <FileText className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{bulkEnquiries.length}</p>
            <p className="text-gray-500">Bulk Enquiries</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm" data-testid="stat-verifications">
            <ShieldCheck className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{verifications.filter(v => v.status === 'pending').length}</p>
            <p className="text-gray-500">Pending Verifications</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-purple-100 rounded-xl p-1 shadow-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white" data-testid="admin-dashboard-tab">
              <BarChart3 className="w-4 h-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white" data-testid="admin-products-tab">Products</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white" data-testid="admin-orders-tab">Orders</TabsTrigger>
            <TabsTrigger value="enquiries" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white" data-testid="admin-enquiries-tab">Enquiries</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white" data-testid="admin-reviews-tab">Reviews</TabsTrigger>
            <TabsTrigger value="verifications" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white" data-testid="admin-verifications-tab">Verifications</TabsTrigger>
          </TabsList>

          {/* Sales Dashboard Tab */}
          <TabsContent value="dashboard">
            <SalesDashboard />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
                <Dialog open={productDialogOpen} onOpenChange={(open) => {
                  if (!open) handleCloseDialog();
                  else setProductDialogOpen(true);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700" data-testid="add-product-button" onClick={() => { setEditingProduct(null); setProductForm(defaultProductForm); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-purple-100 shadow-xl">
                    <DialogHeader className="border-b border-gray-100 pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          {editingProduct ? <Pencil className="w-5 h-5 text-purple-600" /> : <Package className="w-5 h-5 text-purple-600" />}
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-gray-900">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                          </DialogTitle>
                          <p className="text-sm text-gray-500">
                            {editingProduct ? 'Update the product details below' : 'Fill in the product details below'}
                          </p>
                        </div>
                      </div>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduct} className="space-y-6 pt-4">
                      {/* Basic Info Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <Tag className="w-4 h-4 mr-2 text-purple-500" />
                          Basic Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Product Name *</Label>
                            <Input
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              required
                              placeholder="Enter product name"
                              className="mt-1 border-gray-200 focus:border-purple-500"
                              data-testid="product-name-input"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Category *</Label>
                            <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })} required>
                              <SelectTrigger className="mt-1 border-gray-200 focus:border-purple-500" data-testid="product-category-select">
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
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">Description *</Label>
                          <Textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            required
                            rows={3}
                            placeholder="Enter detailed product description"
                            className="mt-1 border-gray-200 focus:border-purple-500"
                            data-testid="product-description-input"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">Image URL *</Label>
                          <Input
                            value={productForm.image}
                            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                            required
                            placeholder="https://example.com/image.jpg"
                            className="mt-1 border-gray-200 focus:border-purple-500"
                            data-testid="product-image-input"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">Gallery Images (comma-separated URLs)</Label>
                          <Input
                            value={productForm.images}
                            onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                            placeholder="url1.jpg, url2.jpg, url3.jpg"
                            className="mt-1 border-gray-200 focus:border-purple-500"
                          />
                          <p className="text-xs text-gray-400 mt-1">Enter multiple image URLs separated by commas</p>
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">Key Features (comma-separated)</Label>
                          <Input
                            value={productForm.keyFeatures}
                            onChange={(e) => setProductForm({ ...productForm, keyFeatures: e.target.value })}
                            placeholder="Premium Quality, ISO Certified, Easy to Use, 1 Year Warranty"
                            className="mt-1 border-gray-200 focus:border-purple-500"
                          />
                          <p className="text-xs text-gray-400 mt-1">These appear as checkmarks on the product page</p>
                        </div>
                      </div>

                      {/* Feature Highlights Section */}
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-purple-500" />
                          Feature Highlights (shown in product page)
                        </h3>
                        <p className="text-xs text-gray-500">Add up to 4 feature highlights with icons</p>
                        {productForm.featureHighlights.map((fh, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 p-3 bg-purple-50 rounded-lg">
                            <div className="col-span-3">
                              <Label className="text-xs text-gray-600">Icon</Label>
                              <Select 
                                value={fh.icon} 
                                onValueChange={(v) => {
                                  const newHighlights = [...productForm.featureHighlights];
                                  newHighlights[idx].icon = v;
                                  setProductForm({ ...productForm, featureHighlights: newHighlights });
                                }}
                              >
                                <SelectTrigger className="mt-1 border-gray-200">
                                  <SelectValue placeholder="Icon" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="zap">Zap (Fast)</SelectItem>
                                  <SelectItem value="shield">Shield (Safe)</SelectItem>
                                  <SelectItem value="timer">Timer (Auto)</SelectItem>
                                  <SelectItem value="award">Award (Quality)</SelectItem>
                                  <SelectItem value="thermometer">Thermometer</SelectItem>
                                  <SelectItem value="volume">Volume (Sound)</SelectItem>
                                  <SelectItem value="check">Check (Certified)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-4">
                              <Label className="text-xs text-gray-600">Title</Label>
                              <Input
                                value={fh.title}
                                onChange={(e) => {
                                  const newHighlights = [...productForm.featureHighlights];
                                  newHighlights[idx].title = e.target.value;
                                  setProductForm({ ...productForm, featureHighlights: newHighlights });
                                }}
                                placeholder="Feature title"
                                className="mt-1 border-gray-200"
                              />
                            </div>
                            <div className="col-span-5">
                              <Label className="text-xs text-gray-600">Description</Label>
                              <Input
                                value={fh.description}
                                onChange={(e) => {
                                  const newHighlights = [...productForm.featureHighlights];
                                  newHighlights[idx].description = e.target.value;
                                  setProductForm({ ...productForm, featureHighlights: newHighlights });
                                }}
                                placeholder="Short description"
                                className="mt-1 border-gray-200"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Section */}
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <Percent className="w-4 h-4 mr-2 text-purple-500" />
                          Pricing & Discount
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Selling Price (₹) *</Label>
                            <Input
                              type="number"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              required
                              placeholder="2499"
                              className="mt-1 border-gray-200 focus:border-purple-500"
                              data-testid="product-price-input"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Original Price (₹)</Label>
                            <Input
                              type="number"
                              value={productForm.originalPrice}
                              onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                              placeholder="2999"
                              className="mt-1 border-gray-200 focus:border-purple-500"
                              data-testid="product-original-price-input"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Discount (%)</Label>
                            <Input
                              type="number"
                              value={productForm.discount}
                              onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                              placeholder="15"
                              max="100"
                              className="mt-1 border-gray-200 focus:border-purple-500"
                              data-testid="product-discount-input"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stock Section */}
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <Box className="w-4 h-4 mr-2 text-purple-500" />
                          Inventory & Stock
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Stock Quantity</Label>
                            <Input
                              type="number"
                              value={productForm.stockQuantity}
                              onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                              placeholder="100"
                              className="mt-1 border-gray-200 focus:border-purple-500"
                              data-testid="product-stock-input"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Min Order Quantity</Label>
                            <Input
                              type="number"
                              value={productForm.minOrderQuantity}
                              onChange={(e) => setProductForm({ ...productForm, minOrderQuantity: e.target.value })}
                              placeholder="1"
                              min="1"
                              className="mt-1 border-gray-200 focus:border-purple-500"
                              data-testid="product-min-order-input"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Warranty & Shipping Section */}
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <ShieldCheck className="w-4 h-4 mr-2 text-purple-500" />
                          Warranty & Shipping
                        </h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Warranty Information</Label>
                          <Textarea
                            value={productForm.warrantyInfo}
                            onChange={(e) => setProductForm({ ...productForm, warrantyInfo: e.target.value })}
                            placeholder="1 Year Manufacturer Warranty covering manufacturing defects"
                            rows={2}
                            className="mt-1 border-gray-200 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">Shipping Information</Label>
                          <Textarea
                            value={productForm.shippingInfo}
                            onChange={(e) => setProductForm({ ...productForm, shippingInfo: e.target.value })}
                            placeholder="Free shipping on all orders across India. Delivery in 2-4 days."
                            rows={2}
                            className="mt-1 border-gray-200 focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* Options Section */}
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-semibold text-gray-700">Product Options</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <Label className="text-gray-700 font-medium cursor-pointer">Available</Label>
                            <Switch
                              checked={productForm.availability}
                              onCheckedChange={(checked) => setProductForm({ ...productForm, availability: checked })}
                              data-testid="product-availability-switch"
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <Label className="text-gray-700 font-medium cursor-pointer">Featured</Label>
                            <Switch
                              checked={productForm.featured}
                              onCheckedChange={(checked) => setProductForm({ ...productForm, featured: checked })}
                              data-testid="product-featured-switch"
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <Label className="text-gray-700 font-medium cursor-pointer">Limited Stock</Label>
                            <Switch
                              checked={productForm.limitedStock}
                              onCheckedChange={(checked) => setProductForm({ ...productForm, limitedStock: checked })}
                              data-testid="product-limited-switch"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4 border-t border-gray-100">
                        <Button 
                          type="submit" 
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                          data-testid="submit-product-button"
                        >
                          {editingProduct ? (
                            <>
                              <Pencil className="w-4 h-4 mr-2" />
                              Update Product
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Create Product
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCloseDialog}
                          className="border-gray-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-100 text-left">
                      <th className="pb-3 font-semibold text-gray-900">Product</th>
                      <th className="pb-3 font-semibold text-gray-900">Category</th>
                      <th className="pb-3 font-semibold text-gray-900">Price</th>
                      <th className="pb-3 font-semibold text-gray-900">Status</th>
                      <th className="pb-3 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-purple-50" data-testid={`admin-product-${product.id}`}>
                        <td className="py-3 text-gray-700">{product.name}</td>
                        <td className="py-3 text-gray-500">{product.category}</td>
                        <td className="py-3 text-purple-600 font-medium">₹{product.price.toLocaleString()}</td>
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
            <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Orders Management</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-purple-100 bg-purple-50 rounded-lg p-4" data-testid={`admin-order-${order.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-purple-600">Total: ₹{order.total_amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Bulk Enquiries Tab */}
          <TabsContent value="enquiries">
            <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Bulk Enquiries Management</h2>
              <div className="space-y-4">
                {bulkEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="border border-purple-100 bg-purple-50 rounded-lg p-4" data-testid={`admin-enquiry-${enquiry.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{enquiry.product?.name}</p>
                        <p className="text-sm text-gray-500">{enquiry.organization_name} - {enquiry.buyer_type}</p>
                        <p className="text-sm text-gray-500">Quantity: {enquiry.quantity}</p>
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
            <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews Management</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-purple-100 bg-purple-50 rounded-lg p-4" data-testid={`admin-review-${review.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{review.user?.name}</p>
                        <p className="text-sm text-gray-500">{review.product?.name}</p>
                        <p className="text-sm mt-2 text-gray-600">{review.comment}</p>
                      </div>
                      <div className="flex space-x-2">
                        {!review.approved && (
                          <>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
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
            <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Verification Requests</h2>
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <div key={verification.id} className="border border-purple-100 bg-purple-50 rounded-lg p-4" data-testid={`admin-verification-${verification.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{verification.user?.name}</p>
                        <p className="text-sm text-gray-500">{verification.organization_name} - {verification.buyer_type}</p>
                        <p className="text-sm text-gray-500">Document: {verification.documents?.info}</p>
                      </div>
                      {verification.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
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
