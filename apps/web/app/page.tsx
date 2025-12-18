"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import HeroCarousel from '@/components/home/HeroCarousel';
import SearchBar from '@/components/home/SearchBar';
import { Shield } from 'lucide-react';
import Image from 'next/image';
import pgRoom from '@/assets/pg-room.jpg';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const router = useRouter();

  // Add welcome toast to test toast system
  useEffect(() => {
    // Show welcome message on page load
    const hasShownWelcome = sessionStorage.getItem('welcome_shown');
    if (!hasShownWelcome) {
      setTimeout(() => {
        toast.success('🏠 Welcome to Rooms Dekho!', {
          description: 'Find your perfect verified room, PG, or flat'
        });
        sessionStorage.setItem('welcome_shown', 'true');
      }, 1000);
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* SEO Meta */}
      <title>Rooms Dekho - Verified Rooms, PGs & Flats | Local Trust</title>
      
      {/* Hero Carousel */}
      <HeroCarousel />
      {/* Search Bar below hero */}
      <SearchBar
        defaultTab="Rent"
        onSearch={({ category, q, city, sector }) => {
          const params = new URLSearchParams();
          
          // Map category to propertyType
          if (category === 'all') {
            // For "All Residential", don't set propertyType to search all types
            params.set('allResidential', 'true');
          } else {
            let propertyType = 'PG';
            if (category === 'rooms') propertyType = 'ROOM';
            else if (category === 'pgs') propertyType = 'PG';
            else if (category === 'flats') propertyType = 'FLAT';
            
            params.set('looking_for', propertyType);
          }
          
          // Add required parameters
          params.set('city', city);
          params.set('townSector', sector);
          
          // Add optional search query
          if (q) params.set('q', q);
          
          router.push(`/properties?${params.toString()}`);
        }}
      />

      {/* Trust Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-primary/5">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-12 mt-4 sm:mt-6 md:mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 md:mb-6">
                Why Choose <span className="text-gradient">Rooms Dekho</span>?
              </h2>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Verified Owners</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">All property owners are KYC verified for your safety and trust.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {/* icon placeholder kept */}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Local Community</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Connect with like-minded students and professionals in your area.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {/* icon placeholder kept */}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Quality Assured</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Every property is reviewed and rated by actual tenants.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-delay relative w-full h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] order-first md:order-last">
              <Image 
                src={pgRoom} 
                alt="Quality housing"
                fill
                className="rounded-lg shadow-[var(--shadow-property)] object-cover"
                priority={false}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;