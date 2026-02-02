import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import VerificationBadge from './VerificationBadge';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card" data-testid={`product-card-${product.id}`}>
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            data-testid="product-image"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg text-slate-900 mb-2 hover:text-primary transition-colors" data-testid="product-name">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-slate-600 mb-3 line-clamp-2" data-testid="product-description">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary" data-testid="product-price">
            ₹{product.price.toLocaleString()}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${product.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} data-testid="product-availability">
            {product.availability ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.availability}
          className="w-full"
          data-testid="add-to-cart-button"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;