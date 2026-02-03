import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    fetchCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await api.put('/cart/update', {
        product_id: productId,
        quantity: newQuantity,
      });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-8" data-testid="cart-title">
          Shopping Cart
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-cart-message">
            <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6">Start shopping to add items to your cart</p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4" data-testid="cart-items-list">
              {cart.items.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 lg:p-6 flex gap-3 sm:gap-4 lg:gap-6"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <Link to={`/product/${item.product_id}`}>
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-lg"
                      data-testid="cart-item-image"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`}>
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-slate-900 hover:text-primary transition-colors mb-1 sm:mb-2 line-clamp-2" data-testid="cart-item-name">
                        {item.product?.name}
                      </h3>
                    </Link>
                    
                    <p className="text-slate-600 text-xs sm:text-sm mb-2 sm:mb-4 hidden sm:block">{item.product?.category}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50"
                          data-testid="decrease-quantity-button"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="font-medium text-sm sm:text-base" data-testid="cart-item-quantity">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 border border-slate-200 rounded hover:bg-slate-100"
                          data-testid="increase-quantity-button"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-primary sm:hidden" data-testid="cart-item-price-mobile">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        data-testid="remove-item-button"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <p className="text-xl lg:text-2xl font-bold text-primary" data-testid="cart-item-price">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      ₹{item.product?.price.toLocaleString()} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 sticky top-20 sm:top-24" data-testid="order-summary">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Order Summary</h2>
                
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between text-sm sm:text-base text-slate-600">
                    <span>Subtotal</span>
                    <span data-testid="subtotal-amount">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base text-slate-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between text-base sm:text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary" data-testid="total-amount">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  data-testid="checkout-button"
                >
                  Proceed to Checkout
                </Button>
                
                <Link to="/products" className="block mt-4">
                  <Button variant="outline" className="w-full" data-testid="continue-shopping-button">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;