import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, Building2, Stethoscope, Warehouse, CheckCircle, Heart, Shield, Activity, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { FullPageLoader } from '../components/MedicalLoader';

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

  if (loading) {
    return <FullPageLoader text="Loading bulk order form..." />;
  }

  return (
    <div className="min-h-screen bg-purple-50" data-testid="bulk-order-page">
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-2xl mb-6">
              <Package className="h-10 w-10 text-purple-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-testid="bulk-order-title">
              Request <span className="text-purple-600">Bulk Order</span> Quote
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Get special pricing for hospitals, clinics, and distributors. Fill out the form below and our team will contact you within 24 hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Benefits Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* Benefits Card */}
              <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                <h3 className="font-semibold text-xl text-gray-900 mb-6">Why Choose Bulk Orders?</h3>
                <div className="space-y-5">
                  {[
                    { icon: CheckCircle, title: 'Special Pricing', desc: 'Competitive rates for bulk purchases', color: 'text-purple-600' },
                    { icon: Shield, title: 'Priority Support', desc: 'Dedicated account manager', color: 'text-purple-600' },
                    { icon: Truck, title: 'Fast Delivery', desc: 'Express shipping for bulk orders', color: 'text-purple-600' },
                    { icon: Activity, title: 'Flexible Payment', desc: 'Custom payment terms available', color: 'text-purple-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Product Card */}
              {product && (
                <div className="bg-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <p className="text-sm opacity-90 mb-2">Selected Product</p>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-3xl font-bold">₹{product.price.toLocaleString()}</p>
                  <p className="text-sm opacity-90 mt-1">per unit</p>
                </div>
              )}

              {/* Trust Stats */}
              <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">1000+</div>
                    <div className="text-sm text-gray-500">Happy Clients</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">50+</div>
                    <div className="text-sm text-gray-500">Cities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-purple-100 p-8 space-y-6 shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-700 font-medium">Product *</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                      <SelectTrigger className="mt-2 border-gray-200 focus:border-purple-500" data-testid="product-select">
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
                    <Label className="text-gray-700 font-medium">Buyer Type *</Label>
                    <Select value={buyerType} onValueChange={setBuyerType} required>
                      <SelectTrigger className="mt-2 border-gray-200 focus:border-purple-500" data-testid="buyer-type-select">
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
                    <Label className="text-gray-700 font-medium">Organization Name *</Label>
                    <Input
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="mt-2 border-gray-200 focus:border-purple-500"
                      placeholder="Enter organization name"
                      required
                      data-testid="organization-input"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">Quantity Required *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-2 border-gray-200 focus:border-purple-500"
                      placeholder="Enter quantity"
                      required
                      data-testid="quantity-input"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Contact Person Name *</Label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="mt-2 border-gray-200 focus:border-purple-500"
                    placeholder="Enter contact person name"
                    required
                    data-testid="contact-name-input"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-700 font-medium">Contact Phone *</Label>
                    <Input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="mt-2 border-gray-200 focus:border-purple-500"
                      placeholder="+91 XXXXX XXXXX"
                      required
                      data-testid="contact-phone-input"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">Contact Email *</Label>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-2 border-gray-200 focus:border-purple-500"
                      placeholder="email@example.com"
                      required
                      data-testid="contact-email-input"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Additional Message</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 border-gray-200 focus:border-purple-500"
                    placeholder="Any specific requirements or questions?"
                    rows={4}
                    data-testid="message-textarea"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg shadow-md"
                    data-testid="submit-bulk-enquiry"
                  >
                    Submit Enquiry
                  </Button>
                  <Button 
                    type="button" 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/products')}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-gray-500 hover:text-purple-600 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrder;
