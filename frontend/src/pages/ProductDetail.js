import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ShoppingCart, Star, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import VerificationBadge from '../components/VerificationBadge';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkEnquiryOpen, setBulkEnquiryOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  
  // Bulk enquiry form
  const [buyerType, setBuyerType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  
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

  const handleBulkEnquiry = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit enquiry');
      return;
    }
    
    try {
      await api.post('/bulk-enquiries', {
        product_id: product.id,
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
      
      toast.success('Bulk enquiry submitted successfully!');
      setBulkEnquiryOpen(false);
      
      // Reset form
      setBuyerType('');
      setQuantity('');
      setOrganizationName('');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to submit enquiry');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Product not found</h2>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen py-8" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div>
            <div className="aspect-square rounded-xl overflow-hidden border border-slate-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-detail-image"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" data-testid="product-detail-name">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold text-primary" data-testid="product-detail-price">
                ₹{product.price.toLocaleString()}
              </span>
              <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                product.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`} data-testid="product-detail-availability">
                {product.availability ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            {reviews.length > 0 && (
              <div className="flex items-center mb-6" data-testid="product-ratings">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="text-slate-600">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            )}
            
            <p className="text-slate-700 leading-relaxed mb-6" data-testid="product-detail-description">
              {product.description}
            </p>
            
            {product.specifications && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6" data-testid="product-specifications">
                <h3 className="font-semibold text-slate-900 mb-4">Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-600">{key}:</span>
                      <span className="font-medium text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.availability}
                className="w-full"
                size="lg"
                data-testid="add-to-cart-detail-button"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Link to={`/bulk-order?product=${product.id}`}>
                <Button variant="outline" className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50" size="lg" data-testid="bulk-enquiry-link">
                  Request Bulk Order Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-slate-200 pt-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-900" data-testid="reviews-section-title">
              Customer Reviews ({reviews.length})
            </h2>
            {user && (
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="write-review-button">Write a Review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <Label>Rating *</Label>
                      <Select value={rating.toString()} onValueChange={(v) => setRating(parseInt(v))} required>
                        <SelectTrigger data-testid="rating-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={r.toString()}>
                              {r} Star{r > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Comment *</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        required
                        data-testid="review-comment-textarea"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" data-testid="submit-review-button">
                      Submit Review
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {reviews.length === 0 ? (
            <p className="text-slate-600 text-center py-8" data-testid="no-reviews-message">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-6" data-testid={`review-${review.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-slate-900">{review.user?.name}</p>
                        {review.user && (
                          <VerificationBadge
                            verification_status={review.user.verification_status}
                            buyer_type={review.user.buyer_type}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;