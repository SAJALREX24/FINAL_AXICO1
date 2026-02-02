import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import api from '../utils/api';

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');

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
  }, []);

  const handleClick = () => {
    const message = encodeURIComponent('Hi, I have an enquiry about medical equipment.');
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  if (!whatsappNumber) return null;

  return (
    <button
      onClick={handleClick}
      className="whatsapp-float bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-200"
      data-testid="whatsapp-button"
      aria-label="Contact via WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
};

export default WhatsAppButton;