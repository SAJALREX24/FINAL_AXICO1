import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Phone, Video, HelpCircle } from 'lucide-react';
import api from '../utils/api';

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/config');
        setWhatsappNumber(response.data.whatsapp_number);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };
    fetchConfig();

    // Show pulse animation for first 10 seconds
    const timer = setTimeout(() => setShowPulse(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleChatClick = (message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${encodedMessage}`, '_blank');
    setIsExpanded(false);
  };

  if (!whatsappNumber) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="whatsapp-widget">
      {/* Expanded Menu */}
      {isExpanded && (
        <div 
          className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in mb-2"
          data-testid="whatsapp-menu"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Alaxico Support</h3>
                  <p className="text-xs text-green-100">Medical Equipment Expert</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 space-y-2">
            <p className="text-xs text-gray-500 px-2 mb-2">How can we help you?</p>
            
            <button
              onClick={() => handleChatClick('Hi, I need help choosing the right medical equipment for my needs.')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-green-50 transition-colors text-left group"
              data-testid="whatsapp-expert-help"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <HelpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Talk to Expert</p>
                <p className="text-xs text-gray-500">Get product recommendations</p>
              </div>
            </button>

            <button
              onClick={() => handleChatClick('Hi, I want to place a bulk order for medical equipment.')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
              data-testid="whatsapp-bulk-order"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Bulk Order Enquiry</p>
                <p className="text-xs text-gray-500">Special pricing for hospitals</p>
              </div>
            </button>

            <button
              onClick={() => handleChatClick('Hi, I need help with my existing order.')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-50 transition-colors text-left group"
              data-testid="whatsapp-order-support"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Order Support</p>
                <p className="text-xs text-gray-500">Track or modify your order</p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Typically replies within <span className="font-medium text-green-600">5 minutes</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 ${isExpanded ? 'rotate-0' : ''}`}
        data-testid="whatsapp-button"
        aria-label="Contact via WhatsApp"
      >
        {/* Pulse Animation */}
        {showPulse && !isExpanded && (
          <>
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50" />
          </>
        )}
        
        {isExpanded ? (
          <X className="h-6 w-6 relative z-10" />
        ) : (
          <MessageCircle className="h-6 w-6 relative z-10" />
        )}
      </button>

      {/* Label */}
      {!isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap">
          <div className="bg-white px-3 py-1.5 rounded-full shadow-lg text-sm font-medium text-gray-700 flex items-center space-x-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Chat with Expert</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppButton;