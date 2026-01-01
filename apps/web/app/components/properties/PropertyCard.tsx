import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  MapPin, 
  Wifi, 
  Car, 
  Coffee, 
  Shield, 
  Heart,
  Users,
  Home
} from 'lucide-react';
import Image from 'next/image';
import { StaticImageData } from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    type: 'PG' | 'ROOM' | 'FLAT' | 'STUDIO';
    price: number;
    location: string;
    image: string | StaticImageData;
    isVerified: boolean;
    gender: 'male' | 'female' | 'coed';
    amenities: string[];
    ownerName: string;
    availableFrom: string;
    listingType?: 'RENT' | 'SALE';
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, wishlist } = useUserData();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if property is in wishlist
  const checkWishlistStatus = () => {
    if (!Array.isArray(wishlist)) return;
    const wishlistItem = wishlist.find(item => 
      item.property?.id === property.id || 
      item.propertyId === property.id
    );
    setIsWishlisted(!!wishlistItem);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Save redirect URL and redirect to login
      try {
        const current = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
        localStorage.setItem('rd_redirect', current);
      } catch {}
      toast.info('Please login to add properties to your wishlist');
      window.location.href = '/login?type=seeker';
      return;
    }

    setIsLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(property.id);
        setIsWishlisted(false);
        toast.success('💔 Removed from Wishlist', {
          description: `${property.title} removed from your favorites`
        });
      } else {
        await addToWishlist(property.id);
        setIsWishlisted(true);
        toast.success('💖 Added to Wishlist!', {
          description: `${property.title} saved to your favorites`
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle wishlist:', error);
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Update wishlist status when wishlist changes
  useEffect(() => {
    checkWishlistStatus();
  }, [wishlist]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PG': return <Users className="w-4 h-4" />;
      case 'FLAT': return <Home className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const getGenderBadge = (gender: string) => {
    const colors = {
      male: 'bg-blue-100 text-blue-800',
      female: 'bg-pink-100 text-pink-800',
      coed: 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      male: 'Boys Only',
      female: 'Girls Only',
      coed: 'Co-ed'
    };

    return (
      <Badge className={`${colors[gender as keyof typeof colors]} border-0`}>
        {labels[gender as keyof typeof labels]}
      </Badge>
    );
  };

  const amenityIcons = {
    'WiFi': Wifi,
    'Parking': Car,
    'Food': Coffee,
  };

  return (
    <Link href={`/properties/${property.id}`} className="block" prefetch>
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ rotateY: 10, y: -5 }}
      className="[perspective:1000px]"
    >
    <Card className="property-card overflow-hidden group cursor-pointer ring-1 ring-transparent hover:ring-sky-200 hover:shadow-xl transition-all duration-300" role="link">
      <div className="relative h-48">
        <Image 
          src={property.image as any}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.isVerified && (
            <div className="verified-badge">
              <Shield className="w-3 h-3" />
              Verified
            </div>
          )}
          <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
            {getTypeIcon(property.type)}
            {property.type}
          </Badge>
          {property.listingType === 'SALE' && (
            <Badge className="bg-purple-500 text-white">
              For Sale
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <button 
            className={`p-2 rounded-full transition-all duration-200 ${
              isWishlisted 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                : 'bg-white/90 hover:bg-white shadow-md'
            }`}
            onClick={handleWishlistToggle}
            disabled={isLoading}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 transition-all ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-lg">
          <span className="text-lg font-bold text-primary">₹{property.price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">
            {property.listingType === 'SALE' ? '' : '/month'}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          {getGenderBadge(property.gender)}
        </div>

        {/* Amenities */}
        <div className="flex items-center space-x-2 mb-4">
          {property.amenities.slice(0, 3).map((amenity) => {
            const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Wifi;
            return (
              <div key={amenity} className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Icon className="w-3 h-3" />
                <span>{amenity}</span>
              </div>
            );
          })}
          {property.amenities.length > 3 && (
            <span className="text-xs text-muted-foreground">+{property.amenities.length - 3} more</span>
          )}
        </div>

        {/* Owner Info */}
        <div className="text-sm text-muted-foreground mb-4">
          Owner: <span className="font-medium">{property.ownerName}</span>
        </div>

        <div className="mt-3">
          <Button className="w-full h-9 text-sm bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600">View Details</Button>
        </div>
      </CardContent>
    </Card>
    </motion.div>
    </Link>
  );
};

export default PropertyCard;