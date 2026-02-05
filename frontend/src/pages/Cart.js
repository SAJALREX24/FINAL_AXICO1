import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Trash2, Plus, Minus, ShoppingBag, ShoppingCart, MapPin, Tag, Truck, ChevronRight, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    fetchCart();
    fetchSimilarProducts();
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

  const fetchSimilarProducts = async () => {
    try {
      const response = await api.get('/products?limit=4');
      setSimilarProducts(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching similar products:', error);
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

  const handleAddToCart = async (product) => {
    try {
      await api.post('/cart/add', {
        product_id: product.id,
        quantity: 1,
      });
      toast.success('Added to cart!');
      fetchCart();
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const calculateMRP = () => {
    return cart.items.reduce((total, item) => {
      const originalPrice = item.product?.original_price || item.product?.price || 0;
      return total + originalPrice * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    return calculateMRP() - calculateTotal();
  };

  const getCouponDiscount = () => {
    if (appliedCoupon) {
      return Math.round(calculateTotal() * 0.1); // 10% discount
    }
    return 0;
  };

  const getFinalAmount = () => {
    return calculateTotal() - getCouponDiscount();
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discount: 10 });
      toast.success('Coupon applied! 10% off');
    } else if (couponCode.toUpperCase() === 'FIRST50') {
      setAppliedCoupon({ code: 'FIRST50', discount: 50 });
      toast.success('Coupon applied! ₹50 off');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="cart-page">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {cart.items.length === 0 ? (
            <div className="max-w-2xl mx-auto" data-testid="empty-cart-message">
              {/* Empty Cart Card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 px-8 py-12 text-center">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
                    <ShoppingCart className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Your Cart is Empty</h2>
                  <p className="text-purple-100 text-lg">Looks like you haven't added anything yet</p>
                </div>
                
                {/* Content Section */}
                <div className="p-8 text-center">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <Truck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 font-medium">Free Delivery</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <ShieldCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 font-medium">Genuine Products</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 font-medium">Easy Returns</p>
                    </div>
                  </div>
                  
                  <Link to="/products">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Start Shopping
                    </Button>
                  </Link>
                  
                  <p className="text-gray-500 text-sm mt-6">
                    Explore our wide range of medical equipment
                  </p>
                </div>
              </div>
              
              {/* Featured Products Suggestion */}
              {similarProducts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Popular Products</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {similarProducts.map((product) => (
                      <Link key={product.id} to={`/product/${product.id}`} className="group">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-square bg-gray-50 overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                            <p className="text-sm font-semibold text-purple-600 mt-1">₹{product.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side - Cart Items */}
              <div className="flex-1">
                {/* Items Count Header */}
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-gray-900" data-testid="cart-title">
                    {cart.items.length} Item{cart.items.length > 1 ? 's' : ''} in cart
                  </h1>
                  <Link to="/products" className="text-purple-600 hover:text-purple-700 font-medium flex items-center text-sm">
                    + Add More Items
                  </Link>
                </div>

                {/* Cart Items */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6" data-testid="cart-items-list">
                  {cart.items.map((item, index) => (
                    <div
                      key={item.product_id}
                      className={`p-4 flex gap-4 ${index !== cart.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                      data-testid={`cart-item-${item.product_id}`}
                    >
                      {/* Product Image */}
                      <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                            data-testid="cart-item-image"
                          />
                        </div>
                      </Link>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product_id}`}>
                          <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-1 line-clamp-2 text-sm" data-testid="cart-item-name">
                            {item.product?.name}
                          </h3>
                        </Link>
                        
                        {item.product?.original_price && item.product.original_price > item.product.price && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-400 line-through text-xs">MRP ₹{item.product.original_price.toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900" data-testid="cart-item-price">
                            ₹{item.product?.price.toLocaleString()}
                          </span>
                          {item.product?.discount_percentage > 0 && (
                            <span className="text-green-600 text-sm font-medium">
                              {item.product.discount_percentage}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-400 hover:text-red-500 transition-colors p-1 h-fit"
                        data-testid="remove-item-button"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg h-fit">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-2 text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:text-gray-400"
                          data-testid="decrease-quantity-button"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 font-medium text-gray-900 min-w-[40px] text-center" data-testid="cart-item-quantity">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-3 py-2 text-purple-600 hover:bg-purple-50"
                          data-testid="increase-quantity-button"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* People Also Bought This */}
                {similarProducts.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">People also bought this</h2>
                      <Link to="/products" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center">
                        View All <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {similarProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <Link to={`/product/${product.id}`}>
                            <div className="aspect-square bg-gray-100 overflow-hidden">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          </Link>
                          <div className="p-3">
                            <Link to={`/product/${product.id}`}>
                              <h3 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1 hover:text-purple-600">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-[10px] text-gray-500 mb-2 line-clamp-1">By {product.brand || 'Alaxico'}</p>
                            {product.original_price && product.original_price > product.price && (
                              <p className="text-[10px] text-gray-400 line-through">MRP ₹{product.original_price}</p>
                            )}
                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-sm font-semibold text-gray-900">₹{product.price.toLocaleString()}</span>
                              {product.discount_percentage > 0 && (
                                <span className="text-[10px] text-green-600 font-medium">{product.discount_percentage}% OFF</span>
                              )}
                            </div>
                            <Button 
                              onClick={() => handleAddToCart(product)}
                              className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Payment Details */}
              <div className="lg:w-[340px] flex-shrink-0">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24" data-testid="order-summary">
                  {/* Delivery Address */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">Add delivery address</h3>
                          <Link to="/checkout" className="text-purple-600 text-sm font-medium">Add</Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Add address & get <span className="text-green-600 font-medium">free delivery</span> on your first order</p>
                      </div>
                    </div>
                  </div>

                  {/* Apply Coupon */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">Apply Coupon</h3>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    {!appliedCoupon ? (
                      <div className="flex gap-2 mt-3">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 h-9 text-sm"
                        />
                        <Button 
                          onClick={applyCoupon}
                          variant="outline" 
                          className="h-9 text-sm border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          Apply
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center justify-between bg-green-50 p-2 rounded-lg">
                        <span className="text-sm text-green-700 font-medium">{appliedCoupon.code} applied</span>
                        <button onClick={removeCoupon} className="text-red-500 text-xs">Remove</button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Try: SAVE10, FIRST50</p>
                  </div>

                  {/* Payment Details */}
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total MRP</span>
                        <span className="text-gray-900">₹{calculateMRP().toLocaleString()}</span>
                      </div>
                      
                      {calculateDiscount() > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount on MRP</span>
                          <span className="text-green-600">- ₹{calculateDiscount().toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Coupon</span>
                        <span className="text-green-600">- ₹{getCouponDiscount()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform Fees</span>
                        <span className="text-gray-400 line-through mr-1">₹10</span>
                        <span className="text-gray-900">₹0</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 underline cursor-help">Handling Charges</span>
                        <span className="text-gray-900">₹0</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Charges</span>
                        <span className="text-green-600 font-medium">FREE</span>
                      </div>
                      
                      {(calculateDiscount() + getCouponDiscount()) > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg flex justify-between">
                          <span className="text-green-700 font-medium text-sm">Total savings</span>
                          <span className="text-green-700 font-semibold">
                            ₹{(calculateDiscount() + getCouponDiscount()).toLocaleString()} ({Math.round(((calculateDiscount() + getCouponDiscount()) / calculateMRP()) * 100)}%)
                          </span>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-100 pt-3 flex justify-between">
                        <span className="font-semibold text-gray-900">Amount to be paid</span>
                        <span className="font-bold text-xl text-gray-900" data-testid="total-amount">₹{getFinalAmount().toLocaleString()}*</span>
                      </div>
                      
                      <p className="text-[10px] text-gray-400">*Final amount may change due to batch changes in products</p>
                    </div>
                    
                    <Button
                      onClick={handleCheckout}
                      className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold mt-4 shadow-md"
                      data-testid="checkout-button"
                    >
                      Proceed
                    </Button>
                    
                    {/* Trust Badge */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>100% Safe and Secure Payment</span>
                    </div>
                    
                    {/* Payment Icons */}
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6" />
                      <span className="text-xs font-semibold text-gray-400">GPay</span>
                      <span className="text-xs font-semibold text-blue-500">Paytm</span>
                      <span className="text-xs font-semibold text-purple-600">PhonePe</span>
                      <span className="text-xs font-semibold text-orange-500">UPI</span>
                    </div>
                  </div>
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
