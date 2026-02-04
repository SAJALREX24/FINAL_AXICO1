import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#E5E7EB]" data-testid={`product-card-${product.id}`}>
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden">
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
      
      <div className="p-3 sm:p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-[#374151] mb-1 sm:mb-2 hover:text-[#2563EB] transition-colors line-clamp-2" data-testid="product-name">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs sm:text-sm text-[#6B7280] mb-2 sm:mb-3 line-clamp-2 hidden sm:block" data-testid="product-description">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#2563EB]" data-testid="product-price">
            ₹{product.price.toLocaleString()}
          </span>
          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${product.availability ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-100 text-red-700'}`} data-testid="product-availability">
            {product.availability ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.availability}
          className="w-full text-xs sm:text-sm h-8 sm:h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          data-testid="add-to-cart-button"
        >
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Add to </span>Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
