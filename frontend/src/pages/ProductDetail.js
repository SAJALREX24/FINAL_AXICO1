import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ShoppingCart, Star, Package, ChevronDown, ChevronUp, Check, Truck, Shield, Award, Clock, Heart, Share2, Minus, Plus, Zap, ThermometerSun, Timer, Volume2, BadgeCheck, Copy, Facebook, Twitter, MessageCircle, Camera, Video, X, Mail, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import VerificationBadge from '../components/VerificationBadge';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import EMICalculator from '../components/EMICalculator';
import ProductCard from '../components/ProductCard';
import { getMedicalAvatar } from '../utils/avatars';
import { FullPageLoader } from '../components/MedicalLoader';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [selectedReviewImage, setSelectedReviewImage] = useState(null);
  
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
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideoUrl, setReviewVideoUrl] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      const [productRes, reviewsRes, relatedRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`),
        api.get(`/products/${id}/related`),
      ]);
      setProduct(productRes.data);
      setReviews(reviewsRes.data);
      setRelatedProducts(relatedRes.data);
      setLikesCount(productRes.data.likes_count || 0);
      
      // Add to recently viewed
      if (productRes.data) {
        addToRecentlyViewed(productRes.data);
      }

      // Check if user has liked this product
      if (user) {
        try {
          const likedRes = await api.get(`/products/${id}/liked`);
          setIsLiked(likedRes.data.liked);
        } catch (e) {
          // Ignore if not logged in
        }
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

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like products');
      return;
    }
    
    try {
      const response = await api.post(`/products/${id}/like`);
      setIsLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
      toast.success(response.data.liked ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name} on Alaxico!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        setShareOpen(false);
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShareOpen(false);
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
        images: reviewImages,
        video_url: reviewVideoUrl || null,
      });
      
      toast.success('Review submitted!');
      setReviewOpen(false);
      setRating(5);
      setComment('');
      setReviewImages([]);
      setReviewVideoUrl('');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (reviewImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    setUploadingMedia(true);
    
    // For demo, we'll use placeholder URLs - in production, upload to cloud storage
    const newImages = files.map((file, index) => 
      URL.createObjectURL(file)
    );
    
    setReviewImages(prev => [...prev, ...newImages]);
    setUploadingMedia(false);
    toast.success(`${files.length} image(s) added`);
  };

  const removeReviewImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
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

  const handleAddRelatedToCart = async (relatedProduct) => {
    try {
      await api.post('/cart/add', {
        product_id: relatedProduct.id,
        quantity: 1,
      });
      toast.success('Added to cart!');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  if (loading) {
    return <FullPageLoader text="Loading product details..." />;
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
    : 4.5;

  // Generate gallery images
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image, product.image, product.image, product.image];

  // Default specifications if not provided
  const defaultSpecs = product.specifications || {
    'Brand': 'Alaxico',
    'Warranty': '1 Year',
    'Material': 'Medical Grade',
    'Certification': 'ISO Certified',
  };

  // Key features for the product
  const keyFeatures = product.key_features || [
    'Premium Quality',
    'ISO Certified',
    'Easy to Use',
    '1 Year Warranty',
  ];

  // Feature highlights with icons
  const featureHighlights = product.feature_highlights || [
    { icon: 'zap', title: 'Fast Performance', description: 'Quick and accurate results' },
    { icon: 'shield', title: 'Medical Grade', description: 'Certified quality materials' },
    { icon: 'timer', title: 'Auto Shutoff', description: 'Energy saving feature' },
    { icon: 'award', title: 'Warranty', description: '1 Year manufacturer warranty' },
  ];

  // Rich content sections
  const richContent = product.rich_content || [];

  // Calculate discount
  const originalPrice = product.original_price || Math.round(product.price * 1.2);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  // Icon mapping
  const getIcon = (iconName) => {
    const icons = {
      zap: Zap,
      shield: Shield,
      timer: Timer,
      award: Award,
      thermometer: ThermometerSun,
      volume: Volume2,
      check: BadgeCheck,
    };
    return icons[iconName] || Zap;
  };

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
              {productImages.slice(0, 4).map((img, idx) => (
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
              {/* Action Buttons - Now Functional */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button 
                  onClick={handleLike}
                  className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all ${
                    isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-purple-50'
                  }`}
                  data-testid="like-button"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                
                {/* Share Button with Dropdown */}
                <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                  <DialogTrigger asChild>
                    <button 
                      className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-purple-50 transition-colors"
                      data-testid="share-button"
                    >
                      <Share2 className="w-5 h-5 text-gray-500" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-900">Share this product</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4 py-4">
                      <button 
                        onClick={() => handleShare('whatsapp')}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-600">WhatsApp</span>
                      </button>
                      <button 
                        onClick={() => handleShare('facebook')}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Facebook className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-600">Facebook</span>
                      </button>
                      <button 
                        onClick={() => handleShare('twitter')}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-sky-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                          <Twitter className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-600">Twitter</span>
                      </button>
                      <button 
                        onClick={() => handleShare('copy')}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                          <Copy className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-600">Copy Link</span>
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Likes Count */}
              {likesCount > 0 && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-600 shadow-sm">
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </div>
              )}
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
                <span className="text-green-700 font-semibold mr-1">{averageRating.toFixed(1)}</span>
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
                  data-testid="decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 font-semibold text-gray-900 border-x border-gray-300" data-testid="quantity-display">{quantity}</span>
                <button 
                  onClick={increaseQuantity}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  data-testid="increase-quantity"
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

        {/* Feature Highlights Section - "Helps With?" style */}
        <div className="mt-12 bg-purple-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Product Highlights</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featureHighlights.map((feature, idx) => {
              const IconComponent = getIcon(feature.icon);
              return (
                <div key={idx} className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-14 h-14 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rich Content Sections */}
        {richContent.length > 0 && richContent.map((section, idx) => (
          <div key={idx} className={`mt-12 py-12 ${idx % 2 === 0 ? 'bg-white' : 'bg-purple-50'} rounded-2xl`}>
            <div className={`max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <p className="text-gray-600 mb-6">{section.description}</p>
                {section.features && (
                  <div className="space-y-3">
                    {section.features.map((feat, fidx) => (
                      <div key={fidx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {section.image && (
                <div className={idx % 2 === 1 ? 'md:order-1' : ''}>
                  <img src={section.image} alt={section.title} className="rounded-xl shadow-lg" />
                </div>
              )}
            </div>
          </div>
        ))}

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
                    <h4 className="font-semibold text-gray-900 mb-2">{product.warranty_info || '1 Year Manufacturer Warranty'}</h4>
                    <p>This product comes with a manufacturer warranty covering manufacturing defects. For warranty claims, please contact our customer support with your invoice and product details.</p>
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
                      <p>{product.shipping_info || 'Free shipping on all orders across India'}</p>
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
        <div className="mt-12 bg-gradient-to-b from-purple-50 to-white rounded-2xl p-6 lg:p-8 border border-purple-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" data-testid="reviews-section-title">
                Customer Reviews
              </h2>
              <p className="text-gray-500 mt-1">{reviews.length} reviews from verified buyers</p>
            </div>
            {user && (
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 shadow-md" data-testid="write-review-button">
                    <Star className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-white border border-purple-100 shadow-xl">
                  <DialogHeader className="border-b border-gray-100 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Share Your Experience</DialogTitle>
                        <p className="text-sm text-gray-500">Help others make better decisions</p>
                      </div>
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleSubmitReview} className="space-y-5 pt-4">
                    {/* Rating */}
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
                        <span className="ml-3 text-sm font-medium text-gray-600">
                          {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Bad'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Comment */}
                    <div>
                      <Label className="text-gray-700 font-medium">Your Review *</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        required
                        placeholder="Share your experience with this product... What did you like or dislike?"
                        className="mt-2 border-gray-200 focus:border-purple-500"
                        data-testid="review-comment-textarea"
                      />
                    </div>
                    
                    {/* Image Upload */}
                    <div>
                      <Label className="text-gray-700 font-medium">Add Photos (Optional)</Label>
                      <p className="text-xs text-gray-500 mt-1">Upload up to 5 photos of the product</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {reviewImages.map((img, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                            <img src={img} alt={`Review ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeReviewImage(index)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {reviewImages.length < 5 && (
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                          >
                            <Camera className="w-6 h-6" />
                            <span className="text-xs mt-1">Add</span>
                          </button>
                        )}
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                    
                    {/* Video URL */}
                    <div>
                      <Label className="text-gray-700 font-medium">Video URL (Optional)</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Video className="w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          value={reviewVideoUrl}
                          onChange={(e) => setReviewVideoUrl(e.target.value)}
                          placeholder="YouTube or video link"
                          className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md h-11"
                        disabled={uploadingMedia}
                        data-testid="submit-review-button"
                      >
                        {uploadingMedia ? 'Uploading...' : 'Submit Review'}
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
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg" data-testid="no-reviews-message">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow" data-testid={`review-${review.id}`}>
                  {/* Review Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img 
                        src={getMedicalAvatar(review.user_id, review.user?.email)} 
                        alt={review.user?.name}
                        className="w-12 h-12 rounded-full border-2 border-purple-100"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{review.user?.name}</span>
                          {review.user && (
                            <VerificationBadge
                              verification_status={review.user.verification_status}
                              buyer_type={review.user.buyer_type}
                            />
                          )}
                        </div>
                        {/* User Email with Favicon */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">{review.user?.email}</span>
                        </div>
                        {/* Stars */}
                        <div className="flex items-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Review Content */}
                  <p className="text-gray-700 mt-4 leading-relaxed">{review.comment}</p>
                  
                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {review.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedReviewImage(img)}
                          className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-400 transition-colors"
                        >
                          <img src={img} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Review Video */}
                  {review.video_url && (
                    <div className="mt-4">
                      <a 
                        href={review.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">Watch Video Review</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Preview Modal */}
        {selectedReviewImage && (
          <Dialog open={!!selectedReviewImage} onOpenChange={() => setSelectedReviewImage(null)}>
            <DialogContent className="max-w-3xl p-0 bg-black border-0">
              <button
                onClick={() => setSelectedReviewImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={selectedReviewImage} alt="Review" className="w-full h-auto rounded-lg" />
            </DialogContent>
          </Dialog>
        )}

        {/* You May Also Like - Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={handleAddRelatedToCart}
                />
              ))}
            </div>
          </div>
        )}

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
