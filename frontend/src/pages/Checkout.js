import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  CreditCard, Truck, ShieldCheck, Banknote, Building, Clock, Check, Smartphone,
  MapPin, Lock, Package, ChevronRight, BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_METHOD_ICONS = {
  razorpay: CreditCard,
  upi: Smartphone,
  cod: Banknote,
  bank_transfer: Building,
  pay_later: Clock,
};

const PAYMENT_METHOD_DETAILS = {
  razorpay: { name: 'Card Payment', description: 'Pay via Debit/Credit Cards, NetBanking', color: 'purple' },
  upi: { name: 'UPI Payment', description: 'GPay, PhonePe, Paytm, BHIM UPI', color: 'green' },
  cod: { name: 'Cash on Delivery', description: 'Pay when you receive', color: 'green' },
  bank_transfer: { name: 'Bank Transfer', description: 'Direct bank transfer (NEFT/RTGS)', color: 'blue' },
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
  const [currentStep, setCurrentStep] = useState(1);
  
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

  const isAddressValid = () => {
    return address.street.trim() && 
           address.city.trim() && 
           address.state.trim() && 
           address.pincode.trim().length >= 6 && 
           address.phone.trim().length >= 10;
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
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }
      
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
            
            toast.success('Payment successful!', { description: 'Your order has been placed' });
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
        theme: { color: '#8B5CF6' },
      };
      
      if (preferredMethod === 'upi') {
        options.config = {
          display: {
            blocks: {
              utib: {
                name: "Pay using UPI",
                instruments: [{ method: "upi", flows: ["qrcode", "collect", "intent"], apps: ["google_pay", "phonepe", "paytm"] }]
              },
              other: {
                name: "Other Payment Methods",
                instruments: [{ method: "card" }, { method: "netbanking" }, { method: "wallet" }]
              }
            },
            sequence: ["block.utib", "block.other"],
            preferences: { show_default_blocks: false }
          }
        };
      }
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => toast.error('Payment failed'));
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment', { description: error.response?.data?.detail || 'Please try again' });
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
      toast.success('Order placed successfully!', { description: response.data.message });
      navigate('/dashboard?tab=orders');
    } catch (error) {
      toast.error('Failed to place order', { description: error.response?.data?.detail || 'Please try again' });
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (!isAddressValid()) {
      toast.error('Please fill all address fields correctly');
      setCurrentStep(1);
      return;
    }
    
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    setProcessing(true);
    
    try {
      if (selectedPaymentMethod === 'razorpay') {
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

  const proceedToPayment = () => {
    if (!isAddressValid()) {
      toast.error('Please fill all address fields correctly');
      return;
    }
    setCurrentStep(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white" data-testid="checkout-page">
      {/* Header with Progress */}
      <div className="bg-white border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              Secure Checkout
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              SSL Encrypted
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 gap-0">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Delivery</span>
            </div>
            <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Payment</span>
            </div>
            <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Confirm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Steps */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Step 1: Delivery Address */}
              <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${currentStep === 1 ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'}`}>
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer ${currentStep === 1 ? 'bg-purple-50' : 'bg-gray-50'}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentStep === 1 ? 'bg-purple-600' : isAddressValid() ? 'bg-green-600' : 'bg-gray-400'}`}>
                      {isAddressValid() && currentStep !== 1 ? <Check className="w-5 h-5 text-white" /> : <MapPin className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">Delivery Address</h2>
                      {isAddressValid() && currentStep !== 1 && (
                        <p className="text-sm text-gray-500">{address.street}, {address.city}</p>
                      )}
                    </div>
                  </div>
                  {currentStep !== 1 && <Button variant="ghost" size="sm" className="text-purple-600">Edit</Button>}
                </div>
                
                {currentStep === 1 && (
                  <div className="p-6 space-y-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Full Address *</Label>
                      <Textarea
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        rows={2}
                        className="mt-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="House/Flat No., Building Name, Street, Area"
                        data-testid="street-input"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700 font-medium">City *</Label>
                        <Input
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="mt-2 border-gray-200 focus:border-purple-500"
                          placeholder="Mumbai"
                          data-testid="city-input"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">State *</Label>
                        <Input
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="mt-2 border-gray-200 focus:border-purple-500"
                          placeholder="Maharashtra"
                          data-testid="state-input"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700 font-medium">PIN Code *</Label>
                        <Input
                          value={address.pincode}
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          className="mt-2 border-gray-200 focus:border-purple-500"
                          placeholder="400001"
                          maxLength={6}
                          data-testid="pincode-input"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">Mobile Number *</Label>
                        <Input
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="mt-2 border-gray-200 focus:border-purple-500"
                          placeholder="9876543210"
                          maxLength={10}
                          data-testid="phone-input"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={proceedToPayment}
                      className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold mt-4"
                      disabled={!isAddressValid()}
                    >
                      Continue to Payment
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 2: Payment Method */}
              <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${currentStep === 2 ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'}`}>
                <div 
                  className={`p-4 flex items-center justify-between ${currentStep === 2 ? 'bg-purple-50' : 'bg-gray-50'} ${currentStep < 2 ? 'opacity-50' : 'cursor-pointer'}`}
                  onClick={() => currentStep >= 2 && setCurrentStep(2)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">Payment Method</h2>
                      {selectedPaymentMethod && currentStep !== 2 && (
                        <p className="text-sm text-gray-500">{PAYMENT_METHOD_DETAILS[selectedPaymentMethod]?.name}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {currentStep === 2 && (
                  <div className="p-6">
                    <div className="grid gap-3">
                      {availablePaymentMethods.map((methodId) => {
                        const method = PAYMENT_METHOD_DETAILS[methodId];
                        const IconComponent = PAYMENT_METHOD_ICONS[methodId] || CreditCard;
                        
                        if (!method) return null;
                        
                        return (
                          <div
                            key={methodId}
                            onClick={() => setSelectedPaymentMethod(methodId)}
                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${
                              selectedPaymentMethod === methodId
                                ? 'border-purple-500 bg-purple-50 shadow-sm'
                                : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
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
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedPaymentMethod === methodId
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedPaymentMethod === methodId && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Payment Info Messages */}
                    {selectedPaymentMethod === 'upi' && (
                      <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
                        <p className="text-sm text-green-700">Pay instantly using GPay, PhonePe, Paytm, or any UPI app.</p>
                      </div>
                    )}
                    
                    {selectedPaymentMethod === 'cod' && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                        <Banknote className="w-5 h-5 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-700">Pay in cash when your order is delivered. Keep exact change ready.</p>
                      </div>
                    )}

                    <form onSubmit={handlePayment}>
                      <Button
                        type="submit"
                        className="w-full mt-6 h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-lg shadow-lg"
                        disabled={processing || !selectedPaymentMethod}
                        data-testid="place-order-button"
                      >
                        {processing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <>
                            {selectedPaymentMethod === 'razorpay' || selectedPaymentMethod === 'emi' || selectedPaymentMethod === 'upi'
                              ? `Pay ₹${calculateTotal().toLocaleString()}`
                              : `Place Order - ₹${calculateTotal().toLocaleString()}`
                            }
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-36 overflow-hidden" data-testid="checkout-summary">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Summary
                  </h2>
                </div>
                
                <div className="p-4 max-h-64 overflow-y-auto border-b border-gray-100">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex gap-3 mb-3 last:mb-0" data-testid={`checkout-item-${item.product_id}`}>
                      <img 
                        src={item.product?.image} 
                        alt={item.product?.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.product?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-purple-600">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>Included</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-purple-600" data-testid="total-amount">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Trust Badges */}
                <div className="bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>100% Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Free Delivery on All Orders</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BadgeCheck className="w-4 h-4 text-purple-600" />
                    <span>Genuine Products Only</span>
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
