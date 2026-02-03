import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 8;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Add product to recently viewed
  const addToRecentlyViewed = useCallback((product) => {
    if (!product || !product.id) return;

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to front and limit to MAX_ITEMS
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recently viewed:', error);
      }
      
      return updated;
    });
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
};

export default useRecentlyViewed;
