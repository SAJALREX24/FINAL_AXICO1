import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, Building2, Stethoscope, Warehouse, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BulkOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [selectedProductId, setSelectedProductId] = useState(productId || '');
  const [buyerType, setBuyerType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productsRes = await api.get('/products');
      setProducts(productsRes.data);
      
      if (productId) {
        const productRes = await api.get(`/products/${productId}`);
        setProduct(productRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit bulk enquiry');
      navigate('/login?redirect=/bulk-order');
      return;
    }
    
    try {
      await api.post('/bulk-enquiries', {
        product_id: selectedProductId,
        buyer_type: buyerType,
        quantity: parseInt(quantity),
        organization_name: organizationName,
        contact_details: {
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
        },
        message,
      });
      
      toast.success('Bulk enquiry submitted successfully!', {
        description: 'Our team will contact you soon',
      });
      
      navigate('/dashboard?tab=bulk-enquiries');
    } catch (error) {
      toast.error('Failed to submit enquiry');
    }
  };

  const buyerTypeIcons = {
    'Hospital': Building2,
    'Clinic': Stethoscope,
    'Doctor': Stethoscope,
    'Distributor': Warehouse,
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
    <div className="min-h-screen py-16 bg-gradient-to-br from-blue-50 via-white to-green-50" data-testid="bulk-order-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-6 shadow-xl">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4" data-testid="bulk-order-title">
            Request Bulk Order Quote
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get special pricing for hospitals, clinics, and distributors. Fill out the form below and our team will contact you within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Benefits Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Why Choose Bulk Orders?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Special Pricing</p>
                    <p className="text-sm text-slate-600">Competitive rates for bulk purchases</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Priority Support</p>
                    <p className="text-sm text-slate-600">Dedicated account manager</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Fast Delivery</p>
                    <p className="text-sm text-slate-600">Express shipping for bulk orders</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Flexible Payment</p>
                    <p className="text-sm text-slate-600">Custom payment terms available</p>
                  </div>
                </div>
              </div>
            </div>

            {product && (
              <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl p-6 text-white shadow-xl">
                <p className="text-sm opacity-90 mb-2">Selected Product</p>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-2xl font-bold">₹{product.price.toLocaleString()}</p>
                <p className="text-sm opacity-90 mt-1">per unit</p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-700 font-medium">Product *</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                    <SelectTrigger className="mt-2 border-2 border-slate-200 focus:border-blue-500" data-testid="product-select">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Buyer Type *</Label>
                  <Select value={buyerType} onValueChange={setBuyerType} required>
                    <SelectTrigger className="mt-2 border-2 border-slate-200 focus:border-blue-500" data-testid="buyer-type-select">
                      <SelectValue placeholder="Select buyer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hospital">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>Hospital</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Clinic">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4" />
                          <span>Clinic</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Doctor">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4" />
                          <span>Doctor</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Distributor">
                        <div className="flex items-center space-x-2">
                          <Warehouse className="h-4 w-4" />
                          <span>Distributor</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-700 font-medium">Organization Name *</Label>
                  <Input
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="mt-2 border-2 border-slate-200 focus:border-blue-500"
                    placeholder="Enter organization name"
                    required
                    data-testid="organization-input"
                  />
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Quantity Required *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-2 border-2 border-slate-200 focus:border-blue-500"
                    placeholder="Enter quantity"
                    required
                    data-testid="quantity-input"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700 font-medium">Contact Person Name *</Label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-2 border-2 border-slate-200 focus:border-blue-500"
                  placeholder="Enter contact person name"
                  required
                  data-testid="contact-name-input"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-700 font-medium">Contact Phone *</Label>
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-2 border-2 border-slate-200 focus:border-blue-500"
                    placeholder="+91 XXXXX XXXXX"
                    required
                    data-testid="contact-phone-input"
                  />
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Contact Email *</Label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-2 border-2 border-slate-200 focus:border-blue-500"
                    placeholder="email@example.com"
                    required
                    data-testid="contact-email-input"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700 font-medium">Additional Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 border-2 border-slate-200 focus:border-blue-500"
                  placeholder="Any specific requirements or questions?"
                  rows={4}
                  data-testid="message-textarea"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="submit-bulk-enquiry"
                >
                  Submit Enquiry
                </Button>
                <Button 
                  type="button" 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/products')}
                  className="border-2 hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrder;
