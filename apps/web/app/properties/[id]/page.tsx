"use client";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Shield, 
  Phone, 
  MessageCircle, 
  Heart,
  Share2,
  Wifi,
  Car,
  Coffee,
  Users,
  Home,
  Calendar,
  CheckCircle
} from 'lucide-react';
import heroProperty from '@/assets/hero-property.jpg';
import pgRoom from '@/assets/pg-room.jpg';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

const PropertyDetail = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params?.id || '');

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, wishlist, contacts, createContact } = useUserData();
  const [showPhone, setShowPhone] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hasContacted, setHasContacted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch property details from backend
        const response = await apiClient.getPropertyDetails(id);
        
        if (response.success && response.data) {
          const foundProperty = response.data;
          // Transform API data to match our UI structure
          const listingType = foundProperty.listingType || 'RENT';
          const price = listingType === 'SALE' 
            ? Number(foundProperty.saleValue || foundProperty.salePrice || 0)
            : Number(foundProperty.rentValue || foundProperty.rent || 0);
          
          const transformedProperty = {
            id: String(foundProperty.id),
            title: foundProperty.title,
            type: foundProperty.propertyType || 'ROOM',
            listingType: listingType,
            price: price,
            location: [foundProperty.city, foundProperty.townSector].filter(Boolean).join(', '),
            address: foundProperty.address || '',
            images: (foundProperty as any).imageUrls && (foundProperty as any).imageUrls.length ? (foundProperty as any).imageUrls : [heroProperty],
            isVerified: foundProperty.isVerified || false,
            gender: (String(foundProperty.genderPreference || '').toLowerCase().includes('male') && 
                    String(foundProperty.genderPreference || '').toLowerCase().includes('female')) ? 'coed' : 
                   (String(foundProperty.genderPreference || '').toLowerCase().includes('male') ? 'male' : 'female'),
            amenities: [...(foundProperty.insideAmenities || []), ...(foundProperty.outsideAmenities || [])],
            ownerName: foundProperty.contactName || 'Owner',
            ownerPhone: foundProperty.whatsappNo || '',
            availableFrom: foundProperty.createdAt ? new Date(foundProperty.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            description: foundProperty.description || '',
            rules: listingType === 'RENT' ? [
              foundProperty.noticePeriod ? `Notice Period: ${foundProperty.noticePeriod}` : '',
              foundProperty.genderPreference ? `Gender Preference: ${foundProperty.genderPreference}` : '',
              foundProperty.preferredTenants && foundProperty.preferredTenants.length ? `Preferred Tenants: ${foundProperty.preferredTenants.join(', ')}` : ''
            ].filter(Boolean) : [],
            nearbyPlaces: [
              { name: foundProperty.landmark || 'Nearby Landmark', distance: 'Walking distance', type: 'Landmark' },
              { name: foundProperty.colony || 'Colony', distance: 'In area', type: 'Area' }
            ].filter(place => place.name !== 'Nearby Landmark' || foundProperty.landmark),
            // Rental property details
            accommodation: foundProperty.accommodation,
            security: foundProperty.security,
            maintenance: foundProperty.maintenance,
            // Sale property details
            carpetArea: foundProperty.carpetArea,
            builtUpArea: foundProperty.builtUpArea,
            pricePerSqft: foundProperty.pricePerSqft,
            propertyAge: foundProperty.propertyAge,
            floorNumber: foundProperty.floorNumber,
            facingDirection: foundProperty.facingDirection,
            possession: foundProperty.possession,
            furnishingDetails: foundProperty.furnishingDetails,
            // Common property details
            bhk: foundProperty.bhk,
            furnished: foundProperty.furnished,
            negotiable: foundProperty.negotiable,
            powerBackup: foundProperty.powerBackup,
            waterSupply: foundProperty.waterSupply,
            parking: foundProperty.parking,
            totalFloors: foundProperty.totalFloors,
            totalUnits: foundProperty.totalUnits,
            offer: foundProperty.offer,
            latitude: foundProperty.latitude,
            longitude: foundProperty.longitude
          };
          setProperty(transformedProperty);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Check wishlist and contact status
  useEffect(() => {
    if (property && user) {
      // Check if property is in wishlist
      if (Array.isArray(wishlist)) {
        const wishlistItem = wishlist.find(item => 
          item.property?.id === property.id || 
          item.propertyId === property.id
        );
        setIsWishlisted(!!wishlistItem);
      }

      // Check if user has already contacted for this property
      if (Array.isArray(contacts)) {
        const contactItem = contacts.find(contact => 
          contact.property?.id === property.id || 
          contact.propertyId === property.id
        );
        setHasContacted(!!contactItem);
        setShowPhone(!!contactItem);
      }
    }
  }, [property, wishlist, contacts, user]);

  // recently viewed (optional)
  useEffect(() => {
    if (!property) return;
    try {
      const key = 'rd_recently_viewed';
      const arr: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      const next = [String(property.id), ...arr.filter((x) => x !== String(property.id))].slice(0, 12);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  }, [property]);

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Parking': Car,
    'Food': Coffee,
    'Laundry': Home,
    'AC': Home,
    'Security': Shield
  };

  // slider hooks must be declared unconditionally to keep hook order
  const [idx, setIdx] = useState(0);
  const images: any[] = useMemo(() => {
    if (!property) return [] as any[];
    return Array.isArray(property.images) && property.images.length ? property.images : [heroProperty];
  }, [property]);
  useEffect(() => {
    if (!property || images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, [property, images.length]);

  // lightbox state (declare unconditionally)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIdx((i) => (i + 1) % (images.length || 1));
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => (i - 1 + (images.length || 1)) % (images.length || 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, images.length]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading property details...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">Property not found</h1>
        <p className="text-muted-foreground">{error || "We couldn't find that listing. Please go back and try again."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <title>{property.title} - Roomlocate | Verified PG in {property.location}</title>

      <AnimatePresence mode="wait">
      <motion.div
        key={property.id}
        initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 [perspective:1200px]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left: Image slider */}
          <div className="lg:col-span-2">
            <motion.div className="relative h-[250px] sm:h-[360px] md:h-[480px] rounded-lg overflow-hidden border [transform-style:preserve-3d]" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Image
                key={idx}
                src={images[idx]}
                alt={property.title}
                fill
                className="object-cover cursor-zoom-in"
                priority={false}
                onClick={() => { setLightboxIdx(idx); setLightboxOpen(true); }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = heroProperty.src || '/placeholder.svg';
                }}
                unoptimized
              />
              <div className="absolute inset-0 bg-black/10" />
              {/* type badges */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
                <Badge className="bg-primary text-primary-foreground flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3" />
                  {property.type}
                </Badge>
                <Badge className={property.listingType === 'SALE' ? 'bg-purple-600 text-white flex items-center gap-1 text-xs' : 'bg-green-600 text-white flex items-center gap-1 text-xs'}>
                  {property.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
                </Badge>
              </div>
              {/* actions */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1.5 sm:gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className={`glass-effect ${isWishlisted ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                  onClick={async () => {
                    if (!user) {
                      try { localStorage.setItem('rd_redirect', `/properties/${id}`); } catch {}
                      router.push('/login?type=seeker');
                      return;
                    }
                    try {
                      if (isWishlisted) {
                        await removeFromWishlist(property.id);
                        setIsWishlisted(false);
                        toast.success('Removed from wishlist');
                      } else {
                        await addToWishlist(property.id);
                        setIsWishlisted(true);
                        toast.success('Added to wishlist');
                      }
                    } catch (error) {
                      console.error('Failed to toggle wishlist:', error);
                      toast.error('Failed to update wishlist');
                    }
                  }}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="glass-effect"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: property.title,
                          text: `Check out this property: ${property.title}`,
                          url: window.location.href,
                        });
                      } catch (error) {
                        console.error('Error sharing:', error);
                      }
                    } else {
                      // Fallback: Copy to clipboard
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              {/* arrows */}
              {images.length > 1 && (
                <>
                  <button aria-label="Prev" onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/80 rounded-full shadow text-lg sm:text-xl">‹</button>
                  <button aria-label="Next" onClick={() => setIdx((i) => (i + 1) % images.length)} className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/80 rounded-full shadow text-lg sm:text-xl">›</button>
                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/60'}`} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Right: Details + owner */}
          <div className="space-y-4 sm:space-y-5">
            <motion.div className="bg-card rounded-lg border p-3 sm:p-4" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex-1">
                  <h1 className="text-lg sm:text-xl font-semibold mb-1.5 leading-snug">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground text-sm mb-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="truncate">{property.location}</span>
                  </div>
                  {property.address && <p className="text-xs text-muted-foreground line-clamp-2">{property.address}</p>}
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-lg sm:text-xl font-bold text-primary leading-tight">₹{property.price.toLocaleString()}</div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground">
                    {property.listingType === 'SALE' ? 'Total Price' : 'per month'}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {property.isVerified && (
                  <div className="verified-badge text-xs"><Shield className="w-3 h-3" />Verified Owner</div>
                )}
                {property.listingType === 'RENT' && (
                  <Badge className={
                    property.gender === 'male' ? 'bg-blue-100 text-blue-800' :
                    property.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                    'bg-purple-100 text-purple-800'
                  }>
                    <span className="text-xs">
                      {property.gender === 'male' ? 'Boys Only' : property.gender === 'female' ? 'Girls Only' : 'Co-ed'}
                    </span>
                  </Badge>
                )}
                {property.negotiable && (
                  <Badge className="bg-green-100 text-green-800">
                    <span className="text-xs">Negotiable</span>
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Contact / Owner Card */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Card className="lg:sticky lg:top-24">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg">{property.ownerName}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Property Owner</p>
                </div>
                <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                  {showPhone && property.ownerPhone ? (
                    <>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">Contact Saved</span>
                        </div>
                        <p className="text-sm text-green-700">You can now view the phone number</p>
                      </div>
                      <Button className="w-full btn-hero" asChild>
                        <a href={`tel:${property.ownerPhone}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          {property.ownerPhone}
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href={`https://wa.me/91${property.ownerPhone}?text=Hi, I'm interested in your property: ${property.title}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp Owner
                        </a>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        {!user
                          ? 'Please login to contact the owner and view their phone number'
                          : user.role === 'OWNER'
                          ? 'Please login using a user account to contact property owners'
                          : 'Click below to save this contact and reveal the phone number'
                        }
                      </p>
                      {user && user.role === 'OWNER' && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold text-orange-900 text-sm">Owner Account Detected</span>
                          </div>
                          <p className="text-xs text-orange-700">
                            You are logged in as an owner. Please login with a user account to contact properties.
                          </p>
                        </div>
                      )}
                      <Button
                        className="w-full btn-hero"
                        onClick={async () => {
                          if (!user) {
                            try { localStorage.setItem('rd_redirect', `/properties/${id}`); } catch {}
                            router.push('/login?type=seeker');
                            return;
                          }
                          if (user.role === 'OWNER') {
                            try { localStorage.setItem('rd_redirect', `/properties/${id}`); } catch {}
                            toast.info('Please login with a user account to contact properties');
                            router.push('/login?type=seeker');
                            return;
                          }
                          if (hasContacted) {
                            setShowPhone(true);
                            return;
                          }
                          setContactLoading(true);
                          try {
                            await createContact(property.id, `Interested in ${property.title}`);
                            setHasContacted(true);
                            setShowPhone(true);
                            toast.success('Contact request sent! Phone number revealed.');
                          } catch (error: any) {
                            console.error('Failed to contact owner:', error);
                            toast.error(error.message || 'Failed to send contact request');
                          } finally {
                            setContactLoading(false);
                          }
                        }}
                        disabled={contactLoading}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {contactLoading ? 'Saving Contact...' : !user ? 'Login to Contact' : user.role === 'OWNER' ? 'Switch to User Account' : 'Contact Owner'}
                      </Button>
                      {!user && (
                        <p className="text-xs text-center text-muted-foreground">
                          You'll be redirected back here after login
                        </p>
                      )}
                      {user && user.role === 'OWNER' && (
                        <p className="text-xs text-center text-muted-foreground">
                          You'll be redirected back here after login
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Available from</span>
                  </div>
                  <div className="font-semibold">{property.availableFrom}</div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>

        {/* Below sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About This Property</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Amenities */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }}>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {property.amenities.map((amenity: string) => {
                      const Icon = amenityIcons[amenity] || CheckCircle;
                      return (
                        <motion.div key={amenity} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-muted/50 rounded-lg" initial={{ opacity: 0, y: 10, rotateY: -10 }} whileInView={{ opacity: 1, y: 0, rotateY: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">{amenity}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Rules - Only for RENT */}
            {property.listingType === 'RENT' && property.rules && property.rules.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">House Rules</h2>
                    <ul className="space-y-2">
                      {property.rules.map((rule: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Nearby Places */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">What's Nearby</h2>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {property.nearbyPlaces.map((place: { name: string; distance: string; type: string }, index: number) => (
                      <motion.div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                        <div>
                          <div className="font-medium">{place.name}</div>
                          <div className="text-sm text-muted-foreground">{place.type}</div>
                        </div>
                        <div className="text-sm font-medium text-primary">{place.distance}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Property Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {property.bhk && (
                      <div className="flex items-center space-x-2 p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm sm:text-base">{property.bhk} BHK</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Configuration</div>
                        </div>
                      </div>
                    )}
                    {property.furnished && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{property.furnished}</div>
                          <div className="text-sm text-muted-foreground">Furnishing</div>
                        </div>
                      </div>
                    )}
                    
                    {/* RENT-specific fields */}
                    {property.listingType === 'RENT' && property.accommodation && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{property.accommodation}</div>
                          <div className="text-sm text-muted-foreground">Accommodation</div>
                        </div>
                      </div>
                    )}
                    {property.listingType === 'RENT' && property.security && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">₹{property.security}</div>
                          <div className="text-sm text-muted-foreground">Security Deposit</div>
                        </div>
                      </div>
                    )}
                    {property.listingType === 'RENT' && property.maintenance && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">₹{property.maintenance}</div>
                          <div className="text-sm text-muted-foreground">Maintenance</div>
                        </div>
                      </div>
                    )}
                    
                    {/* SALE-specific fields */}
                    {property.listingType === 'SALE' && property.carpetArea && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <Home className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{property.carpetArea} sq.ft</div>
                          <div className="text-sm text-muted-foreground">Carpet Area</div>
                        </div>
                      </div>
                    )}
                    {property.listingType === 'SALE' && property.builtUpArea && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <Home className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{property.builtUpArea} sq.ft</div>
                          <div className="text-sm text-muted-foreground">Built-up Area</div>
                        </div>
                      </div>
                    )}
                    {property.listingType === 'SALE' && property.pricePerSqft && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">₹{property.pricePerSqft}</div>
                          <div className="text-sm text-muted-foreground">Price/sq.ft</div>
                        </div>
                      </div>
                    )}
                    {property.listingType === 'SALE' && property.propertyAge && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{property.propertyAge}</div>
                          <div className="text-sm text-muted-foreground">Property Age</div>
                        </div>
                      </div>
                    )}
                    {property.listingType === 'SALE' && property.floorNumber && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <Home className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">Floor {property.floorNumber}</div>
                          <div className="text-sm text-muted-foreground">Floor Number</div>
                        </div>
                      </div>
                    )}
                    {property.listingType === 'SALE' && property.facingDirection && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{property.facingDirection}</div>
                          <div className="text-sm text-muted-foreground">Facing</div>
                        </div>
                      </div>
                    )}
                    {property.listingType === 'SALE' && property.possession && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{property.possession}</div>
                          <div className="text-sm text-muted-foreground">Possession</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Common fields */}
                    {property.parking && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <Car className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{property.parking}</div>
                          <div className="text-sm text-muted-foreground">Parking</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column bottom: safety card */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-success" />
                  Safety Features
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-success" /><span>Owner KYC Verified</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-success" /><span>Property Verified</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-success" /><span>24/7 Security</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-success" /><span>CCTV Surveillance</span></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Map */}
        {(property?.latitude && property?.longitude) || property?.location ? (
          <div className="mt-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Property Location
                </h3>
                <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden border">
                  <iframe
                    src={
                      property?.latitude && property?.longitude 
                        ? `https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude-0.01},${property.latitude-0.01},${property.longitude+0.01},${property.latitude+0.01}&layer=mapnik&marker=${property.latitude},${property.longitude}`
                        : `https://nominatim.openstreetmap.org/search?format=embed&q=${encodeURIComponent(property.location || property.address || '')}`
                    }
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                  {!property?.latitude && !property?.longitude && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Approximate location
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4" onClick={() => setLightboxOpen(false)}>
            <div className="relative w-full max-w-5xl h-[60vh] sm:h-[70vh]" onClick={(e) => e.stopPropagation()}>
              <Image 
                src={images[lightboxIdx] || heroProperty} 
                alt={`${property.title}-full`} 
                fill 
                className="object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = heroProperty.src || '/placeholder.svg';
                }}
                unoptimized
              />
              {images.length > 1 && (
                <>
                  <button aria-label="Prev" onClick={() => setLightboxIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/80 rounded-full shadow text-black text-xl">‹</button>
                  <button aria-label="Next" onClick={() => setLightboxIdx((i) => (i + 1) % images.length)} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/80 rounded-full shadow text-black text-xl">›</button>
                </>
              )}
              <button aria-label="Close" onClick={() => setLightboxOpen(false)} className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-white/80 rounded-full text-black text-xl font-bold">✕</button>
            </div>
          </div>
        )}

      </motion.div>
      </AnimatePresence>

    </div>
  );
}
export default PropertyDetail;