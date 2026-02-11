import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Check, ArrowRight, Scale, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';
import { toast } from 'sonner';

const Compare = () => {
  const [products, setProducts] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Load compare list from localStorage
    const saved = localStorage.getItem('compareList');
    if (saved) {
      setCompareList(JSON.parse(saved));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const results = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addToCompare = (product) => {
    if (compareList.length >= 4) {
      toast.error('Maximum 4 products can be compared');
      return;
    }
    if (compareList.find(p => p.id === product.id)) {
      toast.error('Product already in comparison');
      return;
    }
    const newList = [...compareList, product];
    setCompareList(newList);
    localStorage.setItem('compareList', JSON.stringify(newList));
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    toast.success('Added to comparison');
  };

  const removeFromCompare = (productId) => {
    const newList = compareList.filter(p => p.id !== productId);
    setCompareList(newList);
    localStorage.setItem('compareList', JSON.stringify(newList));
  };

  const clearAll = () => {
    setCompareList([]);
    localStorage.removeItem('compareList');
  };

  const handleAddToCart = async (product) => {
    try {
      await api.post('/cart/add', { product_id: product.id, quantity: 1 });
      toast.success('Added to cart!', { description: product.name });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  // Comparison attributes
  const attributes = [
    { key: 'price', label: 'Price', format: (v) => `₹${v?.toLocaleString() || 'N/A'}` },
    { key: 'category', label: 'Category', format: (v) => v || 'N/A' },
    { key: 'rating', label: 'Rating', format: (v) => v ? `${v} ★` : 'No ratings' },
    { key: 'in_stock', label: 'Availability', format: (v) => v ? '✓ In Stock' : '✗ Out of Stock' },
    { key: 'warranty', label: 'Warranty', format: (v) => v || '1 Year' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12" data-testid="compare-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Scale className="w-8 h-8 text-purple-600" />
              Compare Products
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Compare up to 4 products side by side
            </p>
          </div>
          {compareList.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearAll}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          {/* Compare slots */}
          {[0, 1, 2, 3].map((index) => {
            const product = compareList[index];
            
            if (product) {
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-xl border border-purple-100 overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative h-32 sm:h-40 lg:h-48 bg-gray-100">
                    <img 
                      src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-purple-600 font-bold text-lg">
                      ₹{product.price?.toLocaleString()}
                    </p>
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      size="sm"
                      className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm"
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              );
            }
            
            // Empty slot
            return (
              <div 
                key={`empty-${index}`}
                className="bg-white rounded-xl border-2 border-dashed border-gray-200 h-64 sm:h-72 lg:h-80 flex flex-col items-center justify-center p-4"
              >
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors mb-3"
                >
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </button>
                <p className="text-gray-500 text-xs sm:text-sm text-center">Add product to compare</p>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        {compareList.length >= 2 && (
          <div className="bg-white rounded-xl border border-purple-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-purple-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Specifications Comparison
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {attributes.map((attr, idx) => (
                    <tr key={attr.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-gray-700 text-sm sm:text-base whitespace-nowrap">
                        {attr.label}
                      </td>
                      {compareList.map((product) => (
                        <td 
                          key={product.id} 
                          className="px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-sm sm:text-base"
                        >
                          {attr.format(product[attr.key])}
                        </td>
                      ))}
                      {/* Empty cells for missing products */}
                      {[...Array(4 - compareList.length)].map((_, i) => (
                        <td key={`empty-${i}`} className="px-4 sm:px-6 py-3 sm:py-4 text-gray-300">
                          -
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {compareList.length === 0 && (
          <div className="text-center py-12">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No products to compare</h2>
            <p className="text-gray-500 mb-6">Add products to start comparing</p>
            <Link to="/products">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Browse Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
                  <button 
                    onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                  autoFocus
                />
              </div>
              <div className="max-h-80 overflow-y-auto p-4">
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCompare(product)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-colors text-left"
                      >
                        <img 
                          src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-purple-600">₹{product.price?.toLocaleString()}</p>
                        </div>
                        <Plus className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length > 1 ? (
                  <p className="text-center text-gray-500 py-8">No products found</p>
                ) : (
                  <p className="text-center text-gray-500 py-8">Type to search products</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
