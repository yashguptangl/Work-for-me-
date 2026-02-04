"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeroCarousel from '@/components/home/HeroCarousel';
import SearchBar from '@/components/home/SearchBar';
import { Shield, FileText, X, CheckCircle, Clock, Users, FileCheck, Download } from 'lucide-react';
import Image from 'next/image';
import pgRoom from '@/assets/pg-room.jpg';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const router = useRouter();
  const [showRentAgreementModal, setShowRentAgreementModal] = useState(false);

  // Add welcome toast to test toast system
  useEffect(() => {
    // Show welcome message on page load
    const hasShownWelcome = sessionStorage.getItem('welcome_shown');
    if (!hasShownWelcome) {
      setTimeout(() => {
        toast.success('🏠 Welcome to roomkarts!', {
          description: 'Find your perfect verified room, PG, or flat'
        });
        sessionStorage.setItem('welcome_shown', 'true');
      }, 1000);
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* SEO Meta */}
      <title>roomkarts - Verified Rooms, PGs & Flats | Local Trust</title>
      
      {/* Hero Carousel */}
      <HeroCarousel />
      {/* Search Bar below hero */}
      <SearchBar
        defaultTab="Rent"
        onSearch={({ tab, category, q, city }) => {
          const params = new URLSearchParams();
          
          // Set listing type based on tab
          const listingType = tab === "Rent" ? "RENT" : "SALE";
          params.set('listingType', listingType);
          
          // Map category to propertyType
          if (category === 'all') {
            // For "All Residential", don't set propertyType to search all types
            params.set('allResidential', 'true');
          } else {
            let propertyType = 'PG';
            if (category === 'rooms') propertyType = 'ROOM';
            else if (category === 'pgs') propertyType = 'PG';
            else if (category === 'flats') propertyType = 'FLAT';
            else if (category === 'house') propertyType = 'HOUSE';
            else if (category === 'villa') propertyType = 'VILLA';
            
            params.set('looking_for', propertyType);
          }
          
          // Add required parameters (city only, sector is empty now)
          params.set('city', city);
          
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
                Why Choose <span className="text-gradient">roomkarts</span>?
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
                src={pgRoom.src} 
                alt="Quality housing"
                fill
                className="rounded-lg shadow-[var(--shadow-property)] object-cover"
                priority={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rent Agreement Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-block">
                  <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    Legal Document Service
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Create Your <span className="text-gradient">Rent Agreement</span> Online
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">
                  Generate professionally crafted rent agreements in minutes. Secure, legally valid, and delivered directly to your WhatsApp.
                </p>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm border border-gray-200">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Legally Valid</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm border border-gray-200">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Quick Process</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm border border-gray-200">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">WhatsApp Delivery</span>
                  </div>
                </div>

                <div className="flex flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    onClick={() => setShowRentAgreementModal(true)}
                    className="flex-1 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group whitespace-nowrap"
                  >
                    <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    <span className="hidden xs:inline">View Details</span>
                    <span className="inline xs:hidden">Details</span>
                  </button>
                  <button
                    onClick={() => router.push('/rent-agreement')}
                    className="flex-1 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl font-semibold text-sm sm:text-base md:text-lg shadow hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                  >
                    <span className="hidden xs:inline">Create Agreement</span>
                    <span className="inline xs:hidden">Create</span>
                  </button>
                </div>
              </div>

              {/* Right Content - Preview Card */}
              <div className="relative mt-6 lg:mt-0">
                <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-200 relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-secondary/10 rounded-full blur-3xl opacity-50 -z-10"></div>
                  
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-xl text-gray-900">Rent Agreement</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Professional & Legal</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">Complete Rent Agreement</p>
                        <p className="text-xs sm:text-sm text-gray-600">Instant generation & delivery</p>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>For both Owner & Tenant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Modal */}
      {showRentAgreementModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRentAgreementModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/20 shadow-md">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white truncate">Rent Agreement Service</h3>
                  <p className="text-xs sm:text-sm text-white opacity-90 hidden sm:block">Complete details & features</p>
                </div>
              </div>
              <button
                onClick={() => setShowRentAgreementModal(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-64px)] sm:max-h-[calc(90vh-80px)] px-3 sm:px-4 md:px-6 py-4 sm:py-6">
              {/* What We Offer */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">What We Offer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Legally Valid Documents</h5>
                      <p className="text-xs sm:text-sm text-gray-700">Created by legal experts, compliant with Indian laws</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Quick Generation</h5>
                      <p className="text-xs sm:text-sm text-gray-700">Get your agreement in just minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                    <Download className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">WhatsApp Delivery</h5>
                      <p className="text-xs sm:text-sm text-gray-700">PDF sent directly to your mobile number</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">For Everyone</h5>
                      <p className="text-xs sm:text-sm text-gray-700">Both property owners and tenants can use</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">What&apos;s Included</h4>
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg sm:rounded-xl p-4 sm:p-6 relative hover:shadow-xl transition-shadow">
                    <div className="mb-3 sm:mb-4">
                      <h5 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Complete Rent Agreement Package</h5>
                      <p className="text-xs sm:text-sm text-gray-700">Everything you need for a professional rental agreement</p>
                    </div>
                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-800 font-medium">Professional rent agreement document</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-800 font-medium">PDF format download</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-800 font-medium">Instant WhatsApp delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-800 font-medium">All standard legal clauses included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-800 font-medium">Ready in just minutes</span>
                      </li>
                    </ul>
                    <div className="flex items-center justify-center gap-2 p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <p className="text-xs sm:text-sm text-blue-700 font-semibold">Legally Valid & Secure</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">How It Works</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0 shadow-md">
                      1
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Choose Who You Are</h5>
                      <p className="text-xs sm:text-sm text-gray-700">Select whether you are the property owner or tenant</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0 shadow-md">
                      2
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Fill Required Details</h5>
                      <p className="text-xs sm:text-sm text-gray-700">Enter owner details, tenant details, property info, and agreement terms</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0 shadow-md">
                      3
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Review & Preview</h5>
                      <p className="text-xs sm:text-sm text-gray-700">Preview your complete agreement before payment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0 shadow-md">
                      4
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Make Payment & Receive</h5>
                      <p className="text-xs sm:text-sm text-gray-700">Complete payment and get your agreement PDF on WhatsApp instantly</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <button
                  onClick={() => {
                    setShowRentAgreementModal(false);
                    router.push('/rent-agreement');
                  }}
                  className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Agreement Now
                </button>
                <button
                  onClick={() => setShowRentAgreementModal(false)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;