import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { CreditCard, Truck, ShieldCheck, Banknote, Building, Calendar, Clock, Check, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_METHOD_ICONS = {
  razorpay: CreditCard,
  upi: Smartphone,
  cod: Banknote,
  bank_transfer: Building,
  emi: Calendar,
  pay_later: Clock,
};

const PAYMENT_METHOD_DETAILS = {
  razorpay: { name: 'Card Payment', description: 'Pay via Debit/Credit Cards, NetBanking', color: 'purple' },
  upi: { name: 'UPI Payment', description: 'GPay, PhonePe, Paytm, BHIM UPI', color: 'green' },
  cod: { name: 'Cash on Delivery', description: 'Pay when you receive', color: 'green' },
  bank_transfer: { name: 'Bank Transfer', description: 'Direct bank transfer (NEFT/RTGS)', color: 'blue' },
  emi: { name: 'EMI', description: 'Easy monthly installments', color: 'orange' },
  pay_later: { name: 'Pay Later', description: 'Buy now, pay within 30 days', color: 'teal' },
};

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [cartRes, configRes, paymentMethodsRes] = await Promise.all([
        api.get('/cart'),
        api.get('/config'),
        api.get('/cart/payment-methods'),
      ]);
      setCart(cartRes.data);
      setRazorpayKey(configRes.data.razorpay_key_id);
      setAvailablePaymentMethods(paymentMethodsRes.data.payment_methods || []);
      
      // Set default payment method
      if (paymentMethodsRes.data.payment_methods?.length > 0) {
        setSelectedPaymentMethod(paymentMethodsRes.data.payment_methods[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (preferredMethod = null) => {
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }
      
      // Create order
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product?.name,
          quantity: item.quantity,
          price: item.product?.price,
        })),
        total_amount: calculateTotal(),
        delivery_address: address,
      };
      
      const response = await api.post('/orders/create-razorpay-order', orderData);
      
      // Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'Alaxico',
        description: 'Medical Equipment Purchase',
        order_id: response.data.razorpay_order_id,
        handler: async (razorpayResponse) => {
          try {
            await api.post('/orders/verify-payment', {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });
            
            toast.success('Payment successful!', {
              description: 'Your order has been placed',
            });
            navigate('/dashboard?tab=orders');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.phone,
        },
        theme: {
          color: '#8B5CF6',
        },
      };
      
      // If UPI is selected, configure to show UPI options first
      if (preferredMethod === 'upi') {
        options.config = {
          display: {
            blocks: {
              upi: {
                name: "UPI Payment",
                instruments: [
                  { method: "upi", flows: ["qrcode", "collect", "intent"] }
                ]
              }
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true
            }
          }
        };
      }
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        toast.error('Payment failed');
      });
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      
      if (error.response?.status === 500 || error.response?.data?.detail?.includes('Authentication')) {
        toast.error('Payment Gateway Configuration Required', {
          description: 'Please contact admin to configure valid Razorpay API keys.',
          duration: 8000,
        });
      } else {
        toast.error('Failed to process payment', {
          description: error.response?.data?.detail || 'Please try again',
        });
      }
    }
  };

  const handleCODPayment = async () => {
    try {
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product?.name,
          quantity: item.quantity,
          price: item.product?.price,
        })),
        total_amount: calculateTotal(),
        delivery_address: address,
        payment_method: selectedPaymentMethod,
      };
      
      const response = await api.post('/orders/create-cod-order', orderData);
      
      toast.success('Order placed successfully!', {
        description: response.data.message,
      });
      navigate('/dashboard?tab=orders');
    } catch (error) {
      toast.error('Failed to place order', {
        description: error.response?.data?.detail || 'Please try again',
      });
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    setProcessing(true);
    
    try {
      if (selectedPaymentMethod === 'razorpay' || selectedPaymentMethod === 'emi') {
        await handleRazorpayPayment();
      } else if (selectedPaymentMethod === 'upi') {
        await handleRazorpayPayment('upi');
      } else {
        await handleCODPayment();
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-purple-50" data-testid="checkout-page">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" data-testid="checkout-title">
              Secure <span className="text-purple-600">Checkout</span>
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Address & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address Form */}
              <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <Truck className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street" className="text-gray-700">Street Address *</Label>
                    <Textarea
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      required
                      rows={2}
                      className="mt-2 border-gray-200 focus:border-purple-500"
                      placeholder="Enter your street address"
                      data-testid="street-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-gray-700">City *</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                        className="mt-2 border-gray-200 focus:border-purple-500"
                        placeholder="City"
                        data-testid="city-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state" className="text-gray-700">State *</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        required
                        className="mt-2 border-gray-200 focus:border-purple-500"
                        placeholder="State"
                        data-testid="state-input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pincode" className="text-gray-700">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        required
                        className="mt-2 border-gray-200 focus:border-purple-500"
                        placeholder="PIN Code"
                        data-testid="pincode-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-gray-700">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        required
                        className="mt-2 border-gray-200 focus:border-purple-500"
                        placeholder="+91 XXXXX XXXXX"
                        data-testid="phone-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                </div>
                
                <div className="space-y-3">
                  {availablePaymentMethods.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No payment methods available for these products</p>
                  ) : (
                    availablePaymentMethods.map((methodId) => {
                      const method = PAYMENT_METHOD_DETAILS[methodId];
                      const IconComponent = PAYMENT_METHOD_ICONS[methodId] || CreditCard;
                      
                      if (!method) return null;
                      
                      return (
                        <div
                          key={methodId}
                          onClick={() => setSelectedPaymentMethod(methodId)}
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${
                            selectedPaymentMethod === methodId
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-200'
                          }`}
                          data-testid={`payment-method-${methodId}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              selectedPaymentMethod === methodId ? 'bg-purple-600' : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`w-6 h-6 ${
                                selectedPaymentMethod === methodId ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{method.name}</p>
                              <p className="text-sm text-gray-500">{method.description}</p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPaymentMethod === methodId
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedPaymentMethod === methodId && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Payment Info based on selected method */}
                {selectedPaymentMethod === 'cod' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700">
                      <strong>Cash on Delivery:</strong> Pay in cash when your order is delivered. Please keep exact change ready.
                    </p>
                  </div>
                )}
                
                {selectedPaymentMethod === 'bank_transfer' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <strong>Bank Transfer:</strong> After placing order, you'll receive bank details via email. Complete payment within 24 hours.
                    </p>
                  </div>
                )}
                
                {selectedPaymentMethod === 'pay_later' && (
                  <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
                    <p className="text-sm text-teal-700">
                      <strong>Pay Later:</strong> Get your order now and pay within 30 days. No additional charges.
                    </p>
                  </div>
                )}

                <form onSubmit={handlePayment}>
                  <Button
                    type="submit"
                    className="w-full mt-6 h-14 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg shadow-md"
                    disabled={processing || !selectedPaymentMethod}
                    data-testid="place-order-button"
                  >
                    {processing ? 'Processing...' : (
                      selectedPaymentMethod === 'razorpay' || selectedPaymentMethod === 'emi'
                        ? `Pay ₹${calculateTotal().toLocaleString()}`
                        : `Place Order - ₹${calculateTotal().toLocaleString()}`
                    )}
                  </Button>
                </form>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-purple-100">
                  <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
                    <div className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-1 text-purple-600" />
                      Secure Checkout
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-1 text-purple-600" />
                      Free Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white border border-purple-100 rounded-2xl p-6 sticky top-24 shadow-sm" data-testid="checkout-summary">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex gap-3" data-testid={`checkout-item-${item.product_id}`}>
                      <img 
                        src={item.product?.image} 
                        alt={item.product?.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.product?.name}</p>
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                        <p className="font-semibold text-purple-600">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-purple-100 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-purple-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-purple-600" data-testid="checkout-total">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
