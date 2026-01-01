"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Search, MapPin, Star, Shield } from 'lucide-react';
import heroProperty from '@/assets/hero-property.jpg';
import pgRoom from '@/assets/pg-room.jpg';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: heroProperty,
      title: 'Find Your Perfect Room',
      subtitle: 'Verified PGs, Rooms & Flats with trusted owners',
      location: 'Near IIT Delhi',
      price: '₹8,500/month',
    },
    {
      image: pgRoom,
      title: 'Premium Student Housing',
      subtitle: 'Safe, comfortable spaces for students & professionals',
      location: 'Koramangala, Bangalore',
      price: '₹12,000/month',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="relative inset-0 w-full h-full">
              <Image src={slide.image.src} alt={slide.title} fill className="object-cover" priority={index === 0} />
            </div>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center min-h-[600px]">
        <div className="max-w-2xl text-white animate-slide-up">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-success" />
            <span className="verified-badge">Verified Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{slides[currentSlide]?.title || 'Find Your Perfect Space'}</h1>

          <p className="text-xl md:text-2xl mb-8 text-white/90">{slides[currentSlide]?.subtitle || 'Discover verified rentals near you'}</p>

          {/* Property Info */}
          <div className="flex items-center space-x-6 mb-8 text-sm">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{slides[currentSlide]?.location || 'Multiple Locations'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>4.8 Rating</span>
            </div>
            <div className="font-semibold text-lg">{slides[currentSlide]?.price || '₹5,000/month'}</div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/properties">
              <Button className="btn-hero">
                <Search className="w-5 h-5 mr-2" />
                Explore Properties
              </Button>
            </Link>
            <Link href="/list-property">
              <Button variant="outline" className="glass-effect text-white border-white hover:bg-white hover:text-primary">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;