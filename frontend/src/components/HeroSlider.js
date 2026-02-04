import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Alaxico Catalog Images as Hero Banners
const SLIDES = [
  {
    id: 1,
    image: "https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/nr9rh3hz_1000158422.jpg",
    alt: "Alaxico Piston Compressor Nebulizer",
    ctaLink: "/products?category=Diagnostic%20Equipment",
  },
  {
    id: 2,
    image: "https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/w8w3chjb_1000158424.jpg",
    alt: "Alaxico Electronic Blood Pressure Monitor",
    ctaLink: "/products?category=Patient%20Monitoring",
  },
  {
    id: 3,
    image: "https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/zh92ftef_1000158426.jpg",
    alt: "Alaxico Flexible Digital Thermometer",
    ctaLink: "/products?category=Diagnostic%20Equipment",
  },
  {
    id: 4,
    image: "https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/scah1m8u_1000158428.jpg",
    alt: "Alaxico Electric Hot Water Bag",
    ctaLink: "/products?category=Hospital%20Furniture",
  },
  {
    id: 5,
    image: "https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/jsjdjfz5_1000158430.jpg",
    alt: "Alaxico Steamer Cum Vaporizer",
    ctaLink: "/products?category=Diagnostic%20Equipment",
  },
];

const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false })
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
    <section className="relative overflow-hidden" data-testid="hero-slider">
      {/* Main Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {SLIDES.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              <Link to={slide.ctaLink} className="block cursor-pointer">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] object-cover object-center"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-[#2563EB]/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#1D4ED8] transition-colors z-10 shadow-lg"
        aria-label="Previous slide"
        data-testid="hero-prev-button"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-[#2563EB]/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#1D4ED8] transition-colors z-10 shadow-lg"
        aria-label="Next slide"
        data-testid="hero-next-button"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-10">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? 'w-8 sm:w-10 h-2.5 sm:h-3 bg-[#2563EB]'
                : 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-[#E9D5FF] hover:bg-[#2563EB]/50'
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
