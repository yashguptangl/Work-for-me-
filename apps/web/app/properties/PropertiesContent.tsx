"use client";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard from '@/components/properties/PropertyCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ComboBox from '@/components/ui/ComboBox';
import { citiesData } from '@/lib/cities';
import { 
  Search, 
  MapPin, 
  Grid3X3, 
  List,
  Filter,
  X,
  Home,
  Navigation
} from 'lucide-react';
import heroProperty from '@/assets/hero-property.jpg';
import { apiClient, Property as ApiProperty } from '@/lib/api';
import { useUserData } from '@/hooks/useUserData';
import { toast } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';

const PropertiesContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating'>('relevance');
  const [properties, setProperties] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { addToWishlist, createContact } = useUserData();
  const [nearMeActive, setNearMeActive] = useState(false);
  const [selectedNearMeType, setSelectedNearMeType] = useState<string>('');
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [skipAutoModal, setSkipAutoModal] = useState(false); // Flag to prevent auto-showing modal

  const [filters, setFilters] = useState({
    city: '',
    townSector: '',
    propertyType: '',
    budget: '',
    gender: '',
    amenities: [] as string[]
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [availableTownSectors, setAvailableTownSectors] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [tempSelectedAreas, setTempSelectedAreas] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Get cities data
  const mainCities = Object.keys(citiesData);

  // Fetch available townsectors when temp city changes
  useEffect(() => {
    const fetchAvailableAreas = async () => {
      if (!tempFilters.city) {
        setAvailableTownSectors([]);
        return;
      }

      try {
        const listingType = searchParams?.get('listingType') as 'RENT' | 'SALE' | null;
        const response = await apiClient.getAvailableAreas(tempFilters.city, listingType || undefined);
        
        if (response.success && response.data) {
          setAvailableTownSectors(response.data);
        } else {
          setAvailableTownSectors([]);
        }
      } catch (error) {
        console.error('Error fetching available areas:', error);
        setAvailableTownSectors([]);
      }
    };

    fetchAvailableAreas();
  }, [tempFilters.city, searchParams]);

  // Load properties from API with optional override filters
  const loadProperties = async (overrideFilters?: Partial<typeof filters>, skipEmptyModal: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      // Use override filters if provided, otherwise use current filters, then fall back to URL params
      const currentFilters = overrideFilters || filters;
      const lookingFor = currentFilters.propertyType || searchParams?.get('looking_for') || searchParams?.get('propertyType');
      const allResidential = searchParams?.get('allResidential');
      const city = currentFilters.city || searchParams?.get('city');
      const listingType = searchParams?.get('listingType') as 'RENT' | 'SALE' | null;

      // If multiple areas are selected, we need to fetch for each and combine results
      let allProperties: any[] = [];

      if (selectedAreas.length > 0) {
        // Fetch properties for each selected area
        const promises = selectedAreas.map(async (area) => {
          const searchParamsObj: any = {
            city: city,
            townSector: area
          };

          if (listingType) {
            searchParamsObj.listingType = listingType;
          }

          if (!allResidential && lookingFor && lookingFor !== 'all') {
            searchParamsObj.looking_for = lookingFor;
          } else if (allResidential || !lookingFor || lookingFor === '' || lookingFor === 'all') {
            searchParamsObj.allResidential = 'true';
          }

          const response = await apiClient.searchProperties(searchParamsObj);
          return response.success && response.data ? response.data : [];
        });

        const results = await Promise.all(promises);
        allProperties = results.flat();
      } else {
        // No areas selected, search by city only
        const searchParamsObj: any = {
          city: city
        };

        if (listingType) {
          searchParamsObj.listingType = listingType;
        }

        if (!allResidential && lookingFor && lookingFor !== 'all') {
          searchParamsObj.looking_for = lookingFor;
        } else if (allResidential || !lookingFor || lookingFor === '' || lookingFor === 'all') {
          searchParamsObj.allResidential = 'true';
        }

        const response = await apiClient.searchProperties(searchParamsObj);
        allProperties = response.success && response.data ? response.data : [];
      }
      
      if (allProperties.length > 0) {
        const formattedProperties = allProperties.map((prop: ApiProperty) => {
          // Parse gender preference
          const rawGender = (prop.genderPreference || '').toLowerCase();
          let gender: 'male' | 'female' | 'coed' = 'coed';
          if (rawGender === 'male') gender = 'male';
          else if (rawGender === 'female') gender = 'female';
          else if (rawGender === 'coed' || rawGender === 'co-ed') gender = 'coed';

          // Get the cover image from API response
          const coverImage = prop.coverImage || (prop.imageUrls && prop.imageUrls[0]) || heroProperty;
          
          // Parse price based on listing type
          const price = prop.listingType === 'SALE' 
            ? (prop.saleValue || parseInt(prop.salePrice || '0') || 0)
            : (prop.rentValue || parseInt(prop.rent || '0') || 0);

          // Format location
          const location = [prop.townSector, prop.city].filter(Boolean).join(', ') || prop.address || 'Location unavailable';

          // Combine all amenities
          const amenities = [...(prop.insideAmenities || []), ...(prop.outsideAmenities || [])];

          // Available from date
          const availableFrom = prop.createdAt 
            ? new Date(prop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Available now';

          return {
            id: prop.id,
            title: prop.title || 'Untitled Property',
            type: (prop.propertyType?.toUpperCase() || 'PG') as 'PG' | 'ROOM' | 'FLAT',
            price,
            location,
            image: coverImage,
            isVerified: prop.isVerified || false,
            gender,
            amenities,
            ownerName: prop.contactName || 'Owner',
            availableFrom,
            listingType: prop.listingType || 'RENT',
          };
        });
        setProperties(formattedProperties);
        setShowEmptyModal(false);
        setSkipAutoModal(false); // Reset skip flag when properties found
      } else {
        setProperties([]);
        setError('No properties found');
        // Show toast for empty results with actionable message
        if (!skipEmptyModal) {
          toast.warning('🗘️ No Properties Found', {
            description: 'Try adjusting your search filters or explore nearby areas'
          });
          setShowEmptyModal(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
      console.error('Failed to load properties:', err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Load properties when component mounts or filters change
  useEffect(() => {
    // Check if Near Me params are present in URL
    const nearMe = searchParams?.get('nearMe');
    const latitude = searchParams?.get('latitude');
    const longitude = searchParams?.get('longitude');
    const propertyType = searchParams?.get('propertyType');
    const listingType = searchParams?.get('listingType') as 'RENT' | 'SALE' | null;
    if (nearMe === 'true' && latitude && longitude) {
      // Trigger Near Me search with coordinates from URL
      console.log('🌍 Near Me detected from URL params', { latitude, longitude, propertyType, listingType });
      setSelectedNearMeType(propertyType as any || '');
      // Directly call the Near Me search with coordinates
      loadNearMePropertiesWithCoords(parseFloat(latitude), parseFloat(longitude), propertyType || undefined, listingType || undefined);
    } else {
      // Normal property loading
      loadProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Near Me search with provided coordinates
  const loadNearMePropertiesWithCoords = async (lat: number, lng: number, propertyType?: string, listingType?: 'RENT' | 'SALE') => {
    console.log('📍 Loading Near Me properties with coordinates:', { lat, lng, propertyType, listingType });
    setLoading(true);
    setError(null);
    setNearMeActive(true);

    try {
      console.log('🔄 Calling searchNearMe API...');
      const response = await apiClient.searchNearMe({
        latitude: lat,
        longitude: lng,
        propertyType,
        listingType,
      });

      if (response.success && response.data && response.data.length > 0) {
        const formattedProperties = response.data.map((prop: ApiProperty) => {
          // Parse gender preference
          const rawGender = (prop.genderPreference || '').toLowerCase();
          let gender: 'male' | 'female' | 'coed' = 'coed';
          if (rawGender === 'male') gender = 'male';
          else if (rawGender === 'female') gender = 'female';
          else if (rawGender === 'coed' || rawGender === 'co-ed') gender = 'coed';

          // Get the cover image from API response
          const coverImage = prop.coverImage || (prop.imageUrls && prop.imageUrls[0]) || heroProperty;
          
          // Parse price based on listing type
          const price = prop.listingType === 'SALE' 
            ? (prop.saleValue || parseInt(prop.salePrice || '0') || 0)
            : (prop.rentValue || parseInt(prop.rent || '0') || 0);

          // Format location with distance
          const location = [prop.townSector, prop.city].filter(Boolean).join(', ') || prop.address || 'Location unavailable';
          const distanceText = '';

          // Combine all amenities
          const amenities = [...(prop.insideAmenities || []), ...(prop.outsideAmenities || [])];

          // Available from date
          const availableFrom = prop.createdAt 
            ? new Date(prop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Available now';

          return {
            id: prop.id,
            title: prop.title || 'Untitled Property',
            type: (prop.propertyType?.toUpperCase() || 'PG') as 'PG' | 'ROOM' | 'FLAT',
            price,
            location: distanceText ? `${location} • ${distanceText}` : location,
            image: coverImage,
            isVerified: prop.isVerified || false,
            gender,
            amenities,
            ownerName: prop.contactName || 'Owner',
            availableFrom,
            distance: undefined,
            listingType: prop.listingType || 'RENT',
          };
        });
        
        console.log('✅ Formatted Near Me properties:', formattedProperties.length);
        setProperties(formattedProperties);
        setError(null);
        setShowEmptyModal(false);
        
        // Only show toast for manual Near Me search (not URL params)
        if (!searchParams?.get('nearMe')) {
          toast.success(`📍 Found ${formattedProperties.length} Properties Near You!`, {
            description: `Properties within 10km radius of your location`
          });
        }
      } else {
        console.log('⚠️ No properties found near you');
        setProperties([]);
        const errorMsg = response.message || 'No properties found near you';
        setError(errorMsg);
        setShowEmptyModal(true);
        toast.warning(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ Near Me API Error:', err);
      const errorMsg = err.message || 'Failed to search near you';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Near Me search function
  const amenitiesList = ['WiFi', 'Food', 'Parking', 'Laundry', 'AC', 'Gym'];

  // Derived and sorted properties
  const displayedProperties = useMemo(() => {
    let list = [...properties];
    
    // No need for client-side city/townSector filtering since API handles it
    // Just do local filters like budget, gender, amenities

    // Filter by property type
    if (filters.propertyType) {
      const typeUpper = filters.propertyType.toUpperCase();
      list = list.filter(p => p.type === typeUpper);
    }

    // Filter by gender
    if (filters.gender) {
      list = list.filter(p => p.gender === filters.gender);
    }

    // Filter by budget
    if (filters.budget) {
      const [minStr, maxStr] = filters.budget.split('-');
      const min = parseInt(minStr || '0', 10);
      const max = maxStr?.includes('+') ? Infinity : parseInt(maxStr || '999999', 10);
      list = list.filter(p => p.price >= min && p.price <= max);
    }

    // Filter by amenities
    if (filters.amenities.length) {
      list = list.filter(p => filters.amenities.every(a => p.amenities.includes(a)));
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        // For now, sort by verification status
        list.sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0));
        break;
      default:
        // relevance (no-op for now)
        break;
    }
    return list;
  }, [filters, sortBy, properties]);

  // Reset page when the result set changes
  useEffect(() => {
    setPage(1);
    // Don't auto-show modal when skipAutoModal is true
    if (skipAutoModal) {
      setShowEmptyModal(false);
      return;
    }
    
    // Show empty modal if no properties after filtering
    if (displayedProperties.length === 0 && properties.length > 0) {
      // Filtered to zero - don't show modal, user can clear filters
      setShowEmptyModal(false);
    } else if (displayedProperties.length === 0 && properties.length === 0 && !loading) {
      // No properties at all - show modal
      setShowEmptyModal(true);
    } else {
      setShowEmptyModal(false);
    }
  }, [displayedProperties, properties.length, loading, skipAutoModal]);

  const totalPages = Math.max(1, Math.ceil(displayedProperties.length / pageSize) || 1);
  const paginatedProperties = useMemo(() => {
    const start = (page - 1) * pageSize;
    return displayedProperties.slice(start, start + pageSize);
  }, [displayedProperties, page, pageSize]);

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
        Showing {Math.min((page - 1) * pageSize + 1, displayedProperties.length)}-
        {Math.min(page * pageSize, displayedProperties.length)} of {displayedProperties.length}
      </div>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="h-9 px-3 text-xs sm:text-sm"
        >
          Previous
        </Button>
        <span className="text-xs sm:text-sm font-medium min-w-[80px] text-center">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="h-9 px-3 text-xs sm:text-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const clearFilters = async () => {
    const clearedFilters = {
      city: '',
      townSector: '',
      propertyType: '',
      budget: '',
      gender: '',
      amenities: [] as string[]
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setSelectedAreas([]);
    setTempSelectedAreas([]);
    setSkipAutoModal(true); // Prevent auto-showing modal
    
    toast.info('🧹 Filters Cleared', {
      description: 'All search filters have been reset'
    });
    
    await loadProperties(clearedFilters, true); // Skip empty modal when clearing
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setSelectedAreas(tempSelectedAreas);
    setSkipAutoModal(false);
    setShowFilters(false); // Close filter on mobile
    loadProperties(tempFilters, false);
    toast.success('✅ Filters Applied', {
      description: 'Searching with your selected filters'
    });
  };

  // const handleAddToWishlist = async (propertyId: string) => {
  //   await addToWishlist(propertyId);
  // };

  // const handleContactOwner = async (propertyId: string) => {
  //   await createContact(propertyId, "Interested in this property");
  // };

  const handleNearMe = async () => {
    console.log('🔍 Near Me button clicked from properties page');

    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      toast.error("Your browser doesn't support geolocation");
      return;
    }

    const toastId = toast.loading('Getting your location...');
    console.log('📍 Requesting geolocation permission...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Geolocation success:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        
        toast.success('Location found! Searching nearby properties...', { id: toastId });

        // Use coordinates to search near me
        loadNearMePropertiesWithCoords(
          position.coords.latitude, 
          position.coords.longitude
        );
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        toast.error('Failed to get your location. Please enable location services.', { id: toastId });
      }
    );
  };

  // Lock body scroll on mobile when filter is open, unlock on close
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 1024;
    if (showFilters && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Clean up on unmount or filter close
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta */}
      <title>Properties - roomkarts | Find PGs, Rooms & Flats</title>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          {/* MOBILE FILTER SIDEBAR (framer-motion, scrollable content) */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Overlay for mobile */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
                {/* Filter Panel (mobile only) */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed top-[64px] left-0 bottom-0 w-[90vw] max-w-xs bg-white shadow-xl border flex flex-col overflow-hidden z-50 block lg:hidden"
                  style={{ right: 'auto' }}
                >
                  {/* Fixed Header */}
                  <div className="flex-shrink-0 bg-white z-10 flex items-center justify-between p-4 md:p-6 pb-4 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Filters</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0">
                        Clear All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-8 w-8 shrink-0"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  {/* Scrollable Content (mobile only) */}
                  <div
                    className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 lg:space-y-0"
                    style={{ maxHeight: 'calc(100dvh - 4rem)' }}
                  >
                  {/* Near Me Button */}
                  <div>
                    <Button 
                      className="w-full shadow-sm" 
                    variant={nearMeActive ? "default" : "outline"}
                    onClick={() => {
                      console.log('🔘 Near Me button clicked!', { nearMeActive });
                      if (nearMeActive) {
                        console.log('⏹️ Deactivating Near Me');
                        setNearMeActive(false);
                        setSelectedNearMeType('');
                        loadProperties();
                      } else {
                        console.log('✅ Starting Near Me Search');
                        handleNearMe();
                      }
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {nearMeActive ? `Showing ${selectedNearMeType || 'All'} Near Me` : 'Search Near Me (10km)'}
                  </Button>
                </div>

                {/* City */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-gray-900">City</label>
                  <ComboBox
                    options={mainCities}
                    placeholder="Select city"
                    value={tempFilters.city}
                    onChange={(value) => {
                      setTempFilters(prev => ({ ...prev, city: value, townSector: "" }));
                      setTempSelectedAreas([]); // Clear selected areas when city changes
                    }}
                  />
                </div>

                {/* Town/Sector - Show as checkboxes when city is selected */}
                {tempFilters.city && availableTownSectors.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-gray-900">Areas/Sectors ({availableTownSectors.length} available)</label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                      {availableTownSectors.map((area) => (
                        <label key={`area-${area}`} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={tempSelectedAreas.includes(area)}
                            onChange={() => {
                              setTempSelectedAreas(prev => 
                                prev.includes(area)
                                  ? prev.filter(a => a !== area)
                                  : [...prev, area]
                              );
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Property Type */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-gray-900">Property Type</label>
                  <Select value={tempFilters.propertyType || 'all'} onValueChange={(value: string) => {
                    setTempFilters({...tempFilters, propertyType: value === 'all' ? '' : value});
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Residentials" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Residentials</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="ROOM">Room</SelectItem>
                      <SelectItem value="FLAT">Flat</SelectItem>
                      <SelectItem value="HOUSE">House</SelectItem>
                      <SelectItem value="VILLA">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Apply Filters Button */}
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={applyFilters}
                    disabled={loading || !tempFilters.city}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Applying...' : 'Apply Filters'}
                  </Button>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-gray-900">Budget Range</label>
                  <Select value={filters.budget || 'any'} onValueChange={(value: string) => {
                    const newBudget = value === 'any' ? '' : value;
                    const newFilters = {...filters, budget: newBudget};
                    setFilters(newFilters);
                    setTempFilters(newFilters);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Budget</SelectItem>
                      <SelectItem value="0-5000">Under ₹5,000</SelectItem>
                      <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                      <SelectItem value="10000-15000">₹10,000 - ₹15,000</SelectItem>
                      <SelectItem value="15000-25000">₹15,000 - ₹25,000</SelectItem>
                      <SelectItem value="25000+">Above ₹25,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Preference */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-gray-900">Gender Preference</label>
                  <Select value={filters.gender || 'any'} onValueChange={(value: string) => {
                    const newGender = value === 'any' ? '' : value;
                    const newFilters = {...filters, gender: newGender};
                    setFilters(newFilters);
                    setTempFilters(newFilters);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Gender</SelectItem>
                      <SelectItem value="male">Boys Only</SelectItem>
                      <SelectItem value="female">Girls Only</SelectItem>
                      <SelectItem value="coed">Co-ed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-gray-900">Amenities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map((amenity) => (
                      <Badge
                        key={`amenity-${amenity}`}
                        variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                        className="cursor-pointer justify-center py-2"
                        onClick={() => {
                          const newAmenities = filters.amenities.includes(amenity)
                            ? filters.amenities.filter(a => a !== amenity)
                            : [...filters.amenities, amenity];
                          const newFilters = {...filters, amenities: newAmenities};
                          setFilters(newFilters);
                          setTempFilters(newFilters);
                        }}
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
                </div>
              </motion.div>
            </>
          )}
          {/* DESKTOP FILTER SIDEBAR (sticky, never scrollable, full filter UI) */}
          <aside className="hidden lg:flex lg:sticky top-24 bottom-auto left-0 w-80 bg-white shadow-none rounded-xl border border-gray-200 flex-col overflow-hidden self-start">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-white z-10 flex items-center justify-between p-4 md:p-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Filters</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0">
                  Clear All
                </Button>
              </div>
            </div>
            {/* Full Filter Content (desktop only, not scrollable) */}
            <div className="flex-1 p-4 md:p-6">
              {/* Near Me Button */}
              <div>
                <Button 
                  className="w-full shadow-sm" 
                  variant={nearMeActive ? "default" : "outline"}
                  onClick={() => {
                    if (nearMeActive) {
                      setNearMeActive(false);
                      setSelectedNearMeType('');
                      loadProperties();
                    } else {
                      handleNearMe();
                    }
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {nearMeActive ? `Showing ${selectedNearMeType || 'All'} Near Me` : 'Search Near Me (10km)'}
                </Button>
              </div>
              {/* City */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-900">City</label>
                <ComboBox
                  options={mainCities}
                  placeholder="Select city"
                  value={tempFilters.city}
                  onChange={(value) => {
                    setTempFilters(prev => ({ ...prev, city: value, townSector: "" }));
                    setTempSelectedAreas([]); // Clear selected areas when city changes
                  }}
                />
              </div>
              {/* Town/Sector - Show as checkboxes when city is selected */}
              {tempFilters.city && availableTownSectors.length > 0 && (
                <div>
                  <label className="text-sm font-semibold mb-2 block text-gray-900">Areas/Sectors ({availableTownSectors.length} available)</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                    {availableTownSectors.map((area) => (
                      <label key={`area-${area}`} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          checked={tempSelectedAreas.includes(area)}
                          onChange={() => {
                            setTempSelectedAreas(prev => 
                              prev.includes(area)
                                ? prev.filter(a => a !== area)
                                : [...prev, area]
                            );
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {/* Property Type */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-900">Property Type</label>
                <Select value={tempFilters.propertyType || 'all'} onValueChange={(value: string) => {
                  setTempFilters({...tempFilters, propertyType: value === 'all' ? '' : value});
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Residentials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Residentials</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                    <SelectItem value="ROOM">Room</SelectItem>
                    <SelectItem value="FLAT">Flat</SelectItem>
                    <SelectItem value="HOUSE">House</SelectItem>
                    <SelectItem value="VILLA">Villa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Apply Filters Button */}
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={applyFilters}
                  disabled={loading || !tempFilters.city}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Applying...' : 'Apply Filters'}
                </Button>
              </div>
              {/* Budget */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-900">Budget Range</label>
                <Select value={filters.budget || 'any'} onValueChange={(value: string) => {
                  const newBudget = value === 'any' ? '' : value;
                  const newFilters = {...filters, budget: newBudget};
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Budget</SelectItem>
                    <SelectItem value="0-5000">Under ₹5,000</SelectItem>
                    <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                    <SelectItem value="10000-15000">₹10,000 - ₹15,000</SelectItem>
                    <SelectItem value="15000-25000">₹15,000 - ₹25,000</SelectItem>
                    <SelectItem value="25000+">Above ₹25,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Gender Preference */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-900">Gender Preference</label>
                <Select value={filters.gender || 'any'} onValueChange={(value: string) => {
                  const newGender = value === 'any' ? '' : value;
                  const newFilters = {...filters, gender: newGender};
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Gender</SelectItem>
                    <SelectItem value="male">Boys Only</SelectItem>
                    <SelectItem value="female">Girls Only</SelectItem>
                    <SelectItem value="coed">Co-ed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Amenities */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-900">Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {amenitiesList.map((amenity) => (
                    <Badge
                      key={`amenity-${amenity}`}
                      variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2"
                      onClick={() => {
                        const newAmenities = filters.amenities.includes(amenity)
                          ? filters.amenities.filter(a => a !== amenity)
                          : [...filters.amenities, amenity];
                        const newFilters = {...filters, amenities: newAmenities};
                        setFilters(newFilters);
                        setTempFilters(newFilters);
                      }}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col gap-1.5 mb-1">
              {/* First Row - Filters, View Mode and Count */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  
                  {/* View mode buttons - hidden on mobile */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm md:text-base text-muted-foreground">
                  Showing {displayedProperties.length} properties
                </p>
              </div>

              {/* Second Row - Sort */}
              <div className="flex items-center justify-end gap-2">
                <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as any)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </div>

            {/* Active Filters */}
            {(Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true)) || selectedAreas.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.city && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    City: {filters.city}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      setFilters({...filters, city: ''});
                      setSelectedAreas([]);
                    }} />
                  </Badge>
                )}
                {selectedAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="flex items-center gap-1">
                    Area: {area}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArea(area)} />
                  </Badge>
                ))}
                {filters.propertyType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.propertyType.toUpperCase()}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      setFilters({...filters, propertyType: ''});
                      setTimeout(() => loadProperties(), 100);
                    }} />
                  </Badge>
                )}
                {filters.budget && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Budget: {filters.budget}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, budget: ''})} />
                  </Badge>
                )}
                {filters.gender && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Gender: {filters.gender}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, gender: ''})} />
                  </Badge>
                )}
                {filters.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleAmenity(amenity)} />
                  </Badge>
                ))}
              </div>
            )}

            {/* Properties Grid/List */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="property-card overflow-hidden animate-scale-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="h-48 relative">
                      <Skeleton className="absolute inset-0" />
                    </div>
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedProperties.length === 0 ? (
              // Don't show anything here - the modal will handle it
              null
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:[perspective:1000px]'
                : 'space-y-6'
              }>
                {paginatedProperties.map((property) => (
                  <div key={property.id}>
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination bottom */}
            {paginatedProperties.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <Pagination />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Empty State Modal with Blur Background */}
      {showEmptyModal && !skipAutoModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowEmptyModal(false);
            setSkipAutoModal(false);
            router.push('/');
          }}
        >
          <Card 
            className="max-w-md w-full shadow-2xl bg-white text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-black">Properties Available Soon</CardTitle>
              <CardDescription className="text-base text-gray-700">
                No properties found matching your search criteria. We&apos;re constantly adding new listings!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => {
                  setShowEmptyModal(false);
                  router.push('/');
                }}
              >
                <Home className="w-4 h-4" />
                Back to Home Page
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-black border-gray-300 hover:bg-gray-100"
                onClick={async () => {
                  const clearedFilters = {
                    city: '',
                    townSector: '',
                    propertyType: '',
                    budget: '',
                    gender: '',
                    amenities: [] as string[],
                  };
                  setShowEmptyModal(false);
                  setSkipAutoModal(true); // Prevent auto-showing modal
                  setFilters(clearedFilters);
                  setShowFilters(true); // Open filters sidebar on mobile
                  // Load with cleared filters and skip showing empty modal again
                  await loadProperties(clearedFilters, true);
                }}
              >
                Clear Filters & Search Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PropertiesContent;