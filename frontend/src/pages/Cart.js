import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Trash2, Plus, Minus, ShoppingBag, ShoppingCart } from 'lucide-react';
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
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50" data-testid="cart-page">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" data-testid="cart-title">
              Shopping <span className="text-purple-600">Cart</span>
            </h1>
          </div>

          {cart.items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-purple-100 max-w-lg mx-auto shadow-sm" data-testid="empty-cart-message">
              <ShoppingBag className="h-20 w-20 text-purple-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Start shopping to add items to your cart</p>
              <Link to="/products">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4" data-testid="cart-items-list">
                {cart.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-6 flex gap-4 sm:gap-6 shadow-sm"
                    data-testid={`cart-item-${item.product_id}`}
                  >
                    <Link to={`/product/${item.product_id}`}>
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                        data-testid="cart-item-image"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product_id}`}>
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 hover:text-purple-600 transition-colors mb-2 line-clamp-2" data-testid="cart-item-name">
                          {item.product?.name}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-500 text-sm mb-4 hidden sm:block">{item.product?.category}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 text-gray-700"
                            data-testid="decrease-quantity-button"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-medium text-gray-900 text-lg w-8 text-center" data-testid="cart-item-quantity">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-2 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-gray-700"
                            data-testid="increase-quantity-button"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-500 hover:text-red-600 transition-colors p-2"
                          data-testid="remove-item-button"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right hidden sm:block">
                      <p className="text-2xl font-bold text-purple-600" data-testid="cart-item-price">
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{item.product?.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white border border-purple-100 rounded-2xl p-6 sticky top-24 shadow-sm" data-testid="order-summary">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span data-testid="subtotal-amount">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    <div className="border-t border-purple-100 pt-4 flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-purple-600" data-testid="total-amount">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md"
                    data-testid="checkout-button"
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Link to="/products" className="block mt-4">
                    <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50" data-testid="continue-shopping-button">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
