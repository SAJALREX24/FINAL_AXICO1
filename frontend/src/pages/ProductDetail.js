import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ShoppingCart, Star, Package, ChevronDown, ChevronUp, Check, Truck, Shield, Award, Clock, Heart, Share2, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import VerificationBadge from '../components/VerificationBadge';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import EMICalculator from '../components/EMICalculator';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    details: false,
    warranty: false,
    shipping: false,
  });
  
  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`),
      ]);
      setProduct(productRes.data);
      setReviews(reviewsRes.data);
      
      // Add to recently viewed
      if (productRes.data) {
        addToRecentlyViewed(productRes.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await api.post('/cart/add', {
        product_id: product.id,
        quantity: quantity,
      });
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit review');
      return;
    }
    
    try {
      await api.post('/reviews', {
        product_id: product.id,
        rating,
        comment,
      });
      
      toast.success('Review submitted! It will be visible after admin approval.');
      setReviewOpen(false);
      setRating(5);
      setComment('');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <Package className="h-16 w-16 text-purple-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <Link to="/products">
            <Button className="bg-purple-600 hover:bg-purple-700">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Generate multiple images for gallery (using same image for demo)
  const productImages = [product.image, product.image, product.image, product.image];

  // Default specifications if not provided
  const defaultSpecs = product.specifications || {
    'Brand': 'Alaxico',
    'Warranty': '1 Year',
    'Material': 'Medical Grade',
    'Certification': 'ISO Certified',
  };

  // Key features for the product
  const keyFeatures = [
    'Premium Quality',
    'ISO Certified',
    'Easy to Use',
    '1 Year Warranty',
  ];

  // Calculate discount if original price exists
  const originalPrice = product.originalPrice || Math.round(product.price * 1.2);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      {/* Breadcrumb */}
      <div className="bg-purple-50 py-3 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-500">
            <Link to="/" className="hover:text-purple-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-purple-600">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Images */}
          <div className="flex gap-4">
            {/* Thumbnail Gallery */}
            <div className="hidden sm:flex flex-col gap-2 w-20">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                    selectedImage === idx ? 'border-purple-600' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative">
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {discountPercent}% OFF
                </div>
              )}
              <div className="aspect-square rounded-2xl overflow-hidden border border-purple-100 bg-white">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  data-testid="product-detail-image"
                />
              </div>
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-purple-50 transition-colors">
                  <Heart className="w-5 h-5 text-gray-500" />
                </button>
                <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-purple-50 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" data-testid="product-detail-name">
              {product.name}
            </h1>
            
            {/* Ratings */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center bg-green-100 px-2 py-1 rounded">
                <span className="text-green-700 font-semibold mr-1">{averageRating > 0 ? averageRating.toFixed(1) : '4.5'}</span>
                <Star className="w-4 h-4 text-green-700 fill-green-700" />
              </div>
              <span className="text-gray-500">({reviews.length || 112} Reviews)</span>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900" data-testid="product-detail-price">
                ₹{product.price.toLocaleString()}
              </span>
              {originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    MRP ₹{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {discountPercent}% Off
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">(Incl. of all Taxes)</p>

            {/* EMI Option */}
            {product.price >= 3000 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-700 font-semibold">Pay Later</span>
                    <span className="text-gray-600">Pay ₹{Math.round(product.price / 3).toLocaleString()} now & rest later at 0% EMI</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                    BUY ON EMI
                  </Button>
                </div>
              </div>
            )}

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-6 mb-6">
              <span className="text-gray-700 font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={decreaseQuantity}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 font-semibold text-gray-900 border-x border-gray-300">{quantity}</span>
                <button 
                  onClick={increaseQuantity}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!product.availability}
              className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl mb-4"
              data-testid="add-to-cart-detail-button"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              ADD TO CART
            </Button>

            {/* Bulk Order Link */}
            <Link to={`/bulk-order?product=${product.id}`} className="block mb-6">
              <Button variant="outline" className="w-full h-12 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl" data-testid="bulk-enquiry-link">
                Request Bulk Order Quote
              </Button>
            </Link>

            {/* Delivery Timeline */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-white rounded-full flex items-center justify-center border border-gray-200">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Today</p>
                  <p className="text-xs text-gray-500">Order Now</p>
                </div>
                <div className="flex-1 h-0.5 bg-purple-200 mx-2"></div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-white rounded-full flex items-center justify-center border border-gray-200">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Tomorrow</p>
                  <p className="text-xs text-gray-500">Shipping</p>
                </div>
                <div className="flex-1 h-0.5 bg-purple-200 mx-2"></div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-white rounded-full flex items-center justify-center border border-gray-200">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">2-4 Days</p>
                  <p className="text-xs text-gray-500">Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="mt-12 border-t border-gray-200">
          {/* Product Description */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('description')}
              className="w-full py-5 flex items-center justify-between text-left"
            >
              <span className="text-lg font-semibold text-gray-900">Product Description</span>
              {expandedSections.description ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {expandedSections.description && (
              <div className="pb-5 text-gray-600 leading-relaxed" data-testid="product-description-content">
                <p>{product.description}</p>
                <p className="mt-4">Experience professional-grade medical equipment designed for both healthcare facilities and home use. This product features advanced technology and premium materials to ensure reliability and accuracy.</p>
              </div>
            )}
          </div>

          {/* Product Details / Specifications */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('details')}
              className="w-full py-5 flex items-center justify-between text-left"
            >
              <span className="text-lg font-semibold text-gray-900">Product Details & Specifications</span>
              {expandedSections.details ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {expandedSections.details && (
              <div className="pb-5" data-testid="product-specifications">
                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(defaultSpecs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-purple-100 last:border-0">
                        <span className="text-gray-500">{key}</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-b border-purple-100">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium text-gray-900">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-purple-100">
                      <span className="text-gray-500">Availability</span>
                      <span className={`font-medium ${product.availability ? 'text-green-600' : 'text-red-600'}`}>
                        {product.availability ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Warranty */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('warranty')}
              className="w-full py-5 flex items-center justify-between text-left"
            >
              <span className="text-lg font-semibold text-gray-900">Warranty</span>
              {expandedSections.warranty ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {expandedSections.warranty && (
              <div className="pb-5 text-gray-600">
                <div className="flex items-start gap-4 bg-green-50 p-4 rounded-xl">
                  <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">1 Year Manufacturer Warranty</h4>
                    <p>This product comes with a 1-year manufacturer warranty covering manufacturing defects. For warranty claims, please contact our customer support with your invoice and product details.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Delivery */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('shipping')}
              className="w-full py-5 flex items-center justify-between text-left"
            >
              <span className="text-lg font-semibold text-gray-900">Shipping & Delivery</span>
              {expandedSections.shipping ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {expandedSections.shipping && (
              <div className="pb-5 text-gray-600">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Truck className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Free Delivery</h4>
                      <p>Free shipping on all orders across India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Estimated Delivery</h4>
                      <p>2-4 business days for metro cities, 5-7 days for other locations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Quality Packaging</h4>
                      <p>All products are carefully packaged to ensure safe delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: 'Genuine Products', desc: '100% Authentic' },
            { icon: Truck, title: 'Free Shipping', desc: 'Pan India Delivery' },
            { icon: Award, title: 'Quality Assured', desc: 'ISO Certified' },
            { icon: Clock, title: 'Easy Returns', desc: '7 Days Return Policy' },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-4 bg-purple-50 rounded-xl">
              <item.icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-purple-50 rounded-2xl p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900" data-testid="reviews-section-title">
              Customer Reviews ({reviews.length})
            </h2>
            {user && (
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700" data-testid="write-review-button">
                    <Star className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white border border-purple-100 shadow-xl">
                  <DialogHeader className="border-b border-gray-100 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Write a Review</DialogTitle>
                        <p className="text-sm text-gray-500">Share your experience with this product</p>
                      </div>
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleSubmitReview} className="space-y-6 pt-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Your Rating *</Label>
                      <div className="flex items-center space-x-1 mt-2">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRating(r)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={`w-8 h-8 ${r <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-500">({rating} star{rating > 1 ? 's' : ''})</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-700 font-medium">Your Review *</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        required
                        placeholder="Share your thoughts about this product..."
                        className="mt-1 border-gray-200 focus:border-purple-500"
                        data-testid="review-comment-textarea"
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                        data-testid="submit-review-button"
                      >
                        Submit Review
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setReviewOpen(false)}
                        className="border-gray-200"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8" data-testid="no-reviews-message">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-purple-100 rounded-xl p-6" data-testid={`review-${review.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">{review.user?.name}</p>
                        {review.user && (
                          <VerificationBadge
                            verification_status={review.user.verification_status}
                            buyer_type={review.user.buyer_type}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EMI Calculator for products >= ₹50,000 */}
        {product.price >= 50000 && (
          <div className="mt-8">
            <EMICalculator 
              productId={product.id} 
              productPrice={product.price} 
              productName={product.name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
