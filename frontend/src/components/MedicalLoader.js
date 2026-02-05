import React from 'react';

const MedicalLoader = ({ text = 'Loading...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Medical Cross with Heartbeat Animation */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Pulsing Background Circle */}
        <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-30"></div>
        
        {/* Main Circle with Medical Cross */}
        <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          {/* Medical Cross */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-1/2 h-1/2 text-white"
            fill="currentColor"
          >
            <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM18 14H14V18H10V14H6V10H10V6H14V10H18V14Z"/>
          </svg>
        </div>
        
        {/* Rotating Ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
      </div>
      
      {/* Heartbeat Line */}
      <div className="mt-4 w-32 h-8 overflow-hidden">
        <svg viewBox="0 0 150 40" className="w-full h-full">
          <path
            d="M0,20 L30,20 L35,20 L40,5 L45,35 L50,10 L55,30 L60,20 L90,20 L95,20 L100,5 L105,35 L110,10 L115,30 L120,20 L150,20"
            fill="none"
            stroke="url(#heartbeatGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            className="heartbeat-line"
          />
          <defs>
            <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="1" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Loading Text */}
      {text && (
        <p className="mt-2 text-purple-600 font-medium text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Full Page Loader
export const FullPageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
      <div className="text-center">
        <MedicalLoader text="" size="large" />
        
        {/* Animated Pills */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
        <p className="text-sm text-gray-400 mt-1">Please wait...</p>
      </div>
    </div>
  );
};

// Inline Loader (for buttons, cards, etc.)
export const InlineLoader = ({ size = 'small' }) => {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative">
        <div className={`${size === 'small' ? 'w-5 h-5' : 'w-8 h-8'} border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin`}></div>
      </div>
    </div>
  );
};

// Skeleton Loader for Cards
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default MedicalLoader;
