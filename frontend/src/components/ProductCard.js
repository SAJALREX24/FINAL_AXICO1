import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div 
      className="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full" 
      data-testid={`product-card-${product.id}`}
    >
      {/* Image Container - Fixed Aspect Ratio */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            data-testid="product-image"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&q=80';
            }}
          />
        </div>
      </Link>
      
      {/* Content Container - Flex grow to fill remaining space */}
      <div className="p-3 flex flex-col flex-1">
        {/* Product Name - Fixed Height */}
        <Link to={`/product/${product.id}`}>
          <h3 
            className="font-medium text-sm text-gray-900 mb-1 hover:text-purple-600 transition-colors line-clamp-2 h-10 leading-5" 
            data-testid="product-name"
          >
            {product.name}
          </h3>
        </Link>
        
        {/* Brand/Category - Fixed Height */}
        <p className="text-xs text-gray-500 mb-2 line-clamp-1 h-4">
          By {product.brand || 'Alaxico'}
        </p>
        
        {/* Original Price (if discounted) */}
        {product.original_price && product.original_price > product.price && (
          <p className="text-[10px] text-gray-400 line-through h-3">
            MRP ₹{product.original_price.toLocaleString()}
          </p>
        )}
        
        {/* Price Section - Push to bottom */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-semibold text-gray-900" data-testid="product-price">
              ₹{product.price.toLocaleString()}
            </span>
            {product.discount_percentage > 0 && (
              <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                {product.discount_percentage}% OFF
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-2">
            <span 
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                product.availability 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`} 
              data-testid="product-availability"
            >
              {product.availability ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          {/* Add to Cart Button */}
          <Button
            onClick={() => onAddToCart(product)}
            disabled={!product.availability}
            className="w-full text-xs h-9 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300"
            data-testid="add-to-cart-button"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
