"use client";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard from '@/components/properties/PropertyCard';
import ListPropertyCTA from '@/components/ui/ListPropertyCTA';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ComboBox from '@/components/ui/ComboBox';
import { citiesData } from '@/lib/cities';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Grid3X3, 
  List,
  Filter,
  X,
  Home,
  Navigation
} from 'lucide-react';
import heroProperty from '@/assets/hero-property.jpg';
import pgRoom from '@/assets/pg-room.jpg';
import { apiClient, Property as ApiProperty } from '@/lib/api';
import { useUserData } from '@/hooks/useUserData';
import { toast } from '@/components/ui/sonner';

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
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Get cities and areas data
  const mainCities = Object.keys(citiesData);
  const availableAreas = filters.city && citiesData[filters.city] 
    ? (citiesData[filters.city] ?? [])
    : [];

  // Load properties from API with optional override filters
  const loadProperties = async (overrideFilters?: Partial<typeof filters>, skipEmptyModal: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      // Use override filters if provided, otherwise use current filters, then fall back to URL params
      const currentFilters = overrideFilters || filters;
      const lookingFor = currentFilters.propertyType || searchParams.get('looking_for') || searchParams.get('propertyType');
      const allResidential = searchParams.get('allResidential');
      const city = currentFilters.city || searchParams.get('city');
      const townSector = currentFilters.townSector || searchParams.get('townSector') || searchParams.get('area');
      const listingType = searchParams.get('listingType') as 'RENT' | 'SALE' | null;

      const searchParamsObj: any = {
        city: city,
        townSector: townSector
      };

      // Add listing type to search params
      if (listingType) {
        searchParamsObj.listingType = listingType;
      }

      // Only add looking_for if not searching all residential
      if (!allResidential && lookingFor && lookingFor !== 'all') {
        searchParamsObj.looking_for = lookingFor;
      } else if (allResidential || !lookingFor || lookingFor === '' || lookingFor === 'all') {
        searchParamsObj.allResidential = 'true';
      }

      const response = await apiClient.searchProperties(searchParamsObj);
      
      if (response.success && response.data) {
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
        setError(response.message || 'No properties found');
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
    const nearMe = searchParams.get('nearMe');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const propertyType = searchParams.get('propertyType');
    const listingType = searchParams.get('listingType') as 'RENT' | 'SALE' | null;

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
        if (!searchParams.get('nearMe')) {
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
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min((page - 1) * pageSize + 1, displayedProperties.length)}-
        {Math.min(page * pageSize, displayedProperties.length)} of {displayedProperties.length}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
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
    setSkipAutoModal(true); // Prevent auto-showing modal
    
    toast.info('🧹 Filters Cleared', {
      description: 'All search filters have been reset'
    });
    
    await loadProperties(clearedFilters, true); // Skip empty modal when clearing
  };

  const handleAddToWishlist = async (propertyId: string) => {
    await addToWishlist(propertyId);
  };

  const handleContactOwner = async (propertyId: string) => {
    await createContact(propertyId, "Interested in this property");
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta */}
      <title>Properties - Roomlocate | Find PGs, Rooms & Flats</title>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card rounded-lg border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Near Me Button */}
                <div>
                  <Button 
                    className="w-full" 
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
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <ComboBox
                    options={mainCities}
                    placeholder="Select city"
                    onChange={(value) => setFilters(prev => ({ ...prev, city: value, townSector: "" }))}
                  />
                </div>

                {/* Town/Sector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Town/Sector</label>
                  <ComboBox
                    options={availableAreas}
                    placeholder={
                      filters.city
                        ? availableAreas.length > 0
                          ? "Select area"
                          : "No areas available"
                        : "Choose city first"
                    }
                    onChange={(value) => setFilters(prev => ({ ...prev, townSector: value }))}
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type</label>
                  <Select value={filters.propertyType} onValueChange={(value: string) => {
                    setFilters({...filters, propertyType: value});
                    // Auto-search when property type changes
                    setTimeout(() => loadProperties(), 100);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Residentials</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="ROOM">Room</SelectItem>
                      <SelectItem value="FLAT">Flat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSkipAutoModal(false); // Reset skip flag when user manually searches
                      loadProperties();
                    }}
                    disabled={loading}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Searching...' : 'Search Properties'}
                  </Button>
                  
                  {/* Near Me Button */}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleNearMe}
                    disabled={loading}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Find Near Me
                  </Button>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget Range</label>
                  <Select value={filters.budget} onValueChange={(value: string) => setFilters({...filters, budget: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="text-sm font-medium mb-2 block">Gender Preference</label>
                  <Select value={filters.gender} onValueChange={(value: string) => setFilters({...filters, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Boys Only</SelectItem>
                      <SelectItem value="female">Girls Only</SelectItem>
                      <SelectItem value="coed">Co-ed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Amenities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                        className="cursor-pointer justify-center py-2"
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <p className="text-muted-foreground">
                  Showing {displayedProperties.length} properties
                </p>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
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

                {/* Sort */}
                <div className="hidden md:block w-44">
                  <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as any)}>
                    <SelectTrigger>
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
              </div>
            </div>

            {/* Pagination top */}
            {paginatedProperties.length > 0 && (
              <div className="mb-4">
                <Pagination />
              </div>
            )}

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="cursor-pointer" variant="outline" onClick={() => setFilters({ ...filters, budget: '0-10000' })}>Budget ≤ ₹10k</Badge>
              <Badge className="cursor-pointer" variant="outline" onClick={() => setFilters({ ...filters, propertyType: 'pg' })}>PG</Badge>
              <Badge className="cursor-pointer" variant="outline" onClick={() => setFilters({ ...filters, propertyType: 'room' })}>Room</Badge>
              <Badge className="cursor-pointer" variant="outline" onClick={() => setFilters({ ...filters, propertyType: 'flat' })}>Flat</Badge>
              <Badge className="cursor-pointer" variant="outline" onClick={() => setFilters({ ...filters, amenities: Array.from(new Set([...filters.amenities, 'WiFi'])) })}>WiFi</Badge>
              <Badge className="cursor-pointer" variant="outline" onClick={() => setFilters({ ...filters, gender: 'coed' })}>Co-ed</Badge>
            </div>

            {/* Active Filters */}
            {Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true)) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.city && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    City: {filters.city}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, city: ''})} />
                  </Badge>
                )}
                {filters.townSector && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Town/Sector: {filters.townSector}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, townSector: ''})} />
                  </Badge>
                )}
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
                {paginatedProperties.map((property, idx) => (
                  <div key={property.id}>
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination bottom */}
            {paginatedProperties.length > 0 && (
              <div className="mt-10">
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
                No properties found matching your search criteria. We're constantly adding new listings!
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