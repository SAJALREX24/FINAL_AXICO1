import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Alaxico Landscape Hero Banners - Real product photos with people using products
const SLIDES = [
  {
    id: 1,
    image: "https://static.prod-images.emergentagent.com/jobs/ca9be29b-8ac3-4cf9-b58b-b602c01a2519/images/1e736eb32089855ffa56aaadafdccc75674a08b225ca43d28912520f82e77945.png",
    alt: "Alaxico Piston Compressor Nebulizer",
    title: "Breathe Easy, Live Fully",
    subtitle: "Piston Compressor Nebulizer with Low Noise Operation & 3 Year Warranty",
    features: ["Ultrafine Particles", "Strong Airflow", "Three Layer Filtration"],
    ctaLink: "/products?category=Diagnostic%20Equipment",
    ctaText: "Shop Nebulizers",
  },
  {
    id: 2,
    image: "https://static.prod-images.emergentagent.com/jobs/ca9be29b-8ac3-4cf9-b58b-b602c01a2519/images/c70949d6051c7bb83a241e49ca693d9367ddf5568c309026ef918bcea376d075.png",
    alt: "Alaxico Digital Blood Pressure Monitor",
    title: "Your Heart's Best Friend",
    subtitle: "Rechargeable BP Monitor with Voice Broadcast & 99 Memory Data",
    features: ["Digital LCD", "One Click On/Off", "3 Year Warranty"],
    ctaLink: "/products?category=Patient%20Monitoring",
    ctaText: "Shop BP Monitors",
  },
  {
    id: 3,
    image: "https://static.prod-images.emergentagent.com/jobs/ca9be29b-8ac3-4cf9-b58b-b602c01a2519/images/9b6c2d8dfc7d34a275dc4dc3dd65694a9352eab3c915751d47ee0f382cf5fd8a.png",
    alt: "Alaxico Steamer Cum Vaporizer",
    title: "Pure & Gentle Steam",
    subtitle: "Steamer Vaporizer for Respiratory Relief & Skincare Routines",
    features: ["350 ML Capacity", "Single Wall Safety", "1 Year Warranty"],
    ctaLink: "/products?category=Surgical%20Equipment",
    ctaText: "Shop Vaporizers",
  },
  {
    id: 4,
    image: "https://static.prod-images.emergentagent.com/jobs/ca9be29b-8ac3-4cf9-b58b-b602c01a2519/images/5911a61323832050165d7b697384ea5d0009dc3d4e0d0d88d017425238154dbf.png",
    alt: "Alaxico Electric Hot Water Bag",
    title: "Technology for Healthy Life",
    subtitle: "Electric Hot Water Bag with Superfast Heating & Low Power Consumption",
    features: ["Safe & Secure", "Instant Pain Relief", "Multiple Colors"],
    ctaLink: "/products?category=Hospital%20Furniture",
    ctaText: "Shop Hot Water Bags",
  },
];

const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative overflow-hidden bg-gray-100" data-testid="hero-slider">
      {/* Main Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {SLIDES.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative">
              {/* Image Container - Taller on mobile for breathing room */}
              <div className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[450px] xl:h-[520px]">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading={slide.id === 1 ? "eager" : "lazy"}
                />
                {/* Gradient Overlay - Stronger on mobile for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent sm:from-black/50 sm:via-black/30" />
                
                {/* Content Overlay - Centered vertically with more space */}
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                    <div className="max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                      {/* Title - Larger on mobile, better line height */}
                      <h2 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 drop-shadow-lg leading-snug">
                        {slide.title}
                      </h2>
                      {/* Subtitle - Now visible on mobile too */}
                      <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 drop-shadow-md line-clamp-2">
                        {slide.subtitle}
                      </p>
                      {/* Features - Show on tablet and up */}
                      {slide.features && (
                        <div className="hidden sm:flex flex-wrap gap-2 mb-4 md:mb-5">
                          {slide.features.map((feature, idx) => (
                            <span 
                              key={idx} 
                              className="bg-white/20 backdrop-blur-sm text-white text-xs md:text-sm px-3 py-1 rounded-full border border-white/30"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* CTA Button - Larger touch target on mobile */}
                      <Link to={slide.ctaLink}>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-full text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                          {slide.ctaText}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Better positioned on mobile */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-600 hover:bg-white transition-all z-10 shadow-lg"
        aria-label="Previous slide"
        data-testid="hero-prev-button"
      >
        <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-600 hover:bg-white transition-all z-10 shadow-lg"
        aria-label="Next slide"
        data-testid="hero-next-button"
      >
        <ChevronRight className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      </button>

      {/* Dots Indicator - Larger touch targets on mobile */}
      <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2 lg:gap-3 z-10">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? 'w-6 sm:w-7 lg:w-8 h-2 sm:h-2.5 lg:h-3 bg-purple-600'
                : 'w-2 sm:w-2.5 lg:w-3 h-2 sm:h-2.5 lg:h-3 bg-white/70 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            data-testid={`hero-dot-${index}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
