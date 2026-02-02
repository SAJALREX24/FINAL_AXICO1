import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');
  
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [cartRes, configRes] = await Promise.all([
        api.get('/cart'),
        api.get('/config'),
      ]);
      setCart(cartRes.data);
      setRazorpayKey(configRes.data.razorpay_key_id);
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

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setProcessing(true);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setProcessing(false);
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
        name: 'MedEquipMart',
        description: 'Medical Equipment Purchase',
        order_id: response.data.razorpay_order_id,
        handler: async (razorpayResponse) => {
          try {
            await api.post('/orders/verify-payment', {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });
            
            toast.success('Payment successful!');
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
          color: '#0F67B1',
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        toast.error('Payment failed');
      });
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
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

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-8" data-testid="checkout-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8" data-testid="checkout-title">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Delivery Address Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Delivery Address</h2>
              
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Textarea
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    required
                    rows={2}
                    data-testid="street-input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                      data-testid="city-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                      data-testid="state-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      required
                      data-testid="pincode-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      required
                      data-testid="phone-input"
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full mt-6"
                  size="lg"
                  disabled={processing}
                  data-testid="place-order-button"
                >
                  {processing ? 'Processing...' : `Pay ₹${calculateTotal().toLocaleString()}`}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24" data-testid="checkout-summary">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm" data-testid={`checkout-item-${item.product_id}`}>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.product?.name}</p>
                      <p className="text-slate-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span data-testid="checkout-subtotal">₹{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2">
                  <span>Total</span>
                  <span className="text-primary" data-testid="checkout-total">₹{calculateTotal().toLocaleString()}</span>
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