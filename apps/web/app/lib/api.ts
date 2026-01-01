// API utility functions for connecting frontend to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isVerified: boolean;
}

interface Owner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isVerified: boolean;
  listings: number;
  planType: string;
  validity?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: 'RENT' | 'SALE'; // NEW
  address: string;
  city: string;
  townSector?: string;
  
  // Rental fields
  rent?: string;
  rentValue?: number;
  security?: string;
  maintenance?: string;
  accommodation?: string;
  genderPreference?: string;
  preferredTenants?: string[];
  noticePeriod?: string;
  
  // Sale fields (NEW)
  salePrice?: string;
  saleValue?: number;
  carpetArea?: string;
  builtUpArea?: string;
  pricePerSqft?: string;
  propertyAge?: string;
  floorNumber?: number;
  facingDirection?: string;
  possession?: string;
  furnishingDetails?: string;
  
  // Common fields
  negotiable: boolean;
  bhk: number;
  furnished: string;
  isAvailable: boolean;
  isVerified: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string | null;
  imageUrls?: string[];
  insideAmenities?: string[];
  outsideAmenities?: string[];
  landmark?: string;
  colony?: string;
  contactName?: string;
  whatsappNo?: string;
  powerBackup?: boolean;
  waterSupply?: string;
  parking?: string;
  totalFloors?: number;
  totalUnits?: number;
  offer?: string;
  owner?: {
    id: string | null;
    name: string;
    phone?: string | null;
    isVerified?: boolean;
  } | null;
}

export type PropertySearchParams = {
  search?: string;
  city?: string;
  townSector?: string;
  propertyType?: string;
  listingType?: 'RENT' | 'SALE'; // NEW
  genderPreference?: string;
  furnished?: string;
  parking?: string;
  minRent?: number;
  maxRent?: number;
  minPrice?: number; // NEW for sale properties
  maxPrice?: number; // NEW for sale properties
  insideAmenities?: string[];
  outsideAmenities?: string[];
};

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // User Auth APIs
  async userSignup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<ApiResponse<{ user: User; token: string; otp: number }>> {
    return this.request('/user/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async userLogin(data: {
    phone: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/user/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async userVerifyOtp(data: {
    phone: string;
    otp: number;
  }): Promise<ApiResponse> {
    return this.request('/user/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async userForgotPassword(data: {
    phone: string;
  }): Promise<ApiResponse> {
    return this.request('/user/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async userResetPassword(data: {
    phone: string;
    otp: number;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.request('/user/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async userResendOtp(data: { phone: string }): Promise<ApiResponse> {
    return this.request('/user/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Owner Auth APIs
  async ownerSignup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<ApiResponse<{ owner: Owner; token: string; otp: number }>> {
    return this.request('/owner/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async ownerLogin(data: {
    phone: string;
    password: string;
  }): Promise<ApiResponse<{ owner: Owner; token: string }>> {
    return this.request('/owner/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async ownerVerifyOtp(data: {
    phone: string;
    otp: number;
  }): Promise<ApiResponse> {
    return this.request('/owner/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async ownerForgotPassword(data: {
    phone: string;
  }): Promise<ApiResponse> {
    return this.request('/owner/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async ownerResetPassword(data: {
    phone: string;
    otp: number;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.request('/owner/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async ownerResendOtp(data: { phone: string }): Promise<ApiResponse> {
    return this.request('/owner/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOwnerProfile(): Promise<ApiResponse<Owner>> {
    return this.request('/owner/auth/profile');
  }

  async updateOwnerProfile(data: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<ApiResponse<{ owner: Owner }>> {
    return this.request('/owner/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Property APIs
  async createProperty(data: any): Promise<ApiResponse<Property>> {
    return this.request('/owner/property/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Location APIs
  async reverseGeocode(latitude: number, longitude: number): Promise<ApiResponse<{ address: string; latitude: number; longitude: number }>> {
    return this.request('/near/reverse-geocode', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async getOwnerProperties(): Promise<ApiResponse<Property[]>> {
    return this.request(`/owner/property/my-properties`);
  }

  async getPropertyById(propertyId: string): Promise<ApiResponse<Property>> {
    return this.request(`/owner/property/${propertyId}`);
  }

  async updateProperty(propertyId: string, data: any): Promise<ApiResponse<Property>> {
    return this.request(`/owner/property/update-property/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async togglePropertyAvailability(propertyId: string): Promise<ApiResponse<Property>> {
    return this.request(`/owner/property/toggle-availability/${propertyId}`, {
      method: 'PATCH',
    });
  }

  async deleteProperty(propertyId: string): Promise<ApiResponse> {
    return this.request(`/owner/property/${propertyId}`, {
      method: 'DELETE',
    });
  }

  // Owner Listing OTP Methods - Protected routes requiring authentication
  async sendOwnerListingOTP(mobile: string): Promise<ApiResponse<{ message: string; otp?: number }>> {
    return this.request('/owner-listing/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyOwnerListingOTP(mobile: string, otp: string): Promise<ApiResponse<{ message: string; verified: boolean }>> {
    return this.request('/owner-listing/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }

  async uploadPropertyImages(propertyId: string, ownerId: string) {
    return this.request<{ presignedUrls: Record<string, string> }>('/owner/property/upload-images', {
      method: 'POST',
      body: JSON.stringify({ propertyId, ownerId }),
    });
  }

  async publishProperty(propertyId: string) {
    return this.request(`/owner/property/publish/${propertyId}`, {
      method: 'PATCH',
    });
  }

  // Search APIs
  async searchProperties(params: PropertySearchParams = {}): Promise<ApiResponse<Property[]>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item) {
            searchParams.append(key, item);
          }
        });
      } else {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/search/property?${queryString}` : '/search/property';

    return this.request(endpoint);
  }

  async getAllProperties(params?: { looking_for?: string; city?: string; townSector?: string; listingType?: 'RENT' | 'SALE' }): Promise<ApiResponse<Property[]>> {
    // Provide default parameters if not specified
    const defaultParams = {
      looking_for: params?.looking_for || 'PG',
      city: params?.city || 'Delhi',
      townSector: params?.townSector || 'All',
      listingType: params?.listingType || 'RENT' // NEW
    };
    
    const searchParams = new URLSearchParams();
    searchParams.append('looking_for', defaultParams.looking_for);
    searchParams.append('city', defaultParams.city);
    searchParams.append('townSector', defaultParams.townSector);
    searchParams.append('listingType', defaultParams.listingType); // NEW
    
    return this.request(`/search/property?${searchParams.toString()}`);
  }

  async getPropertyDetails(propertyId: string): Promise<ApiResponse<Property>> {
    return this.request(`/search/property/${propertyId}`);
  }

  async searchNearMe(params: {
    latitude: number;
    longitude: number;
    propertyType?: string;
    listingType?: 'RENT' | 'SALE';
    radius?: number;
  }): Promise<ApiResponse<Property[]>> {
    const searchParams = new URLSearchParams();
    searchParams.append('latitude', params.latitude.toString());
    searchParams.append('longitude', params.longitude.toString());
    
    if (params.propertyType) {
      searchParams.append('propertyType', params.propertyType);
    }
    
    if (params.listingType) {
      searchParams.append('listingType', params.listingType);
    }
    
    if (params.radius) {
      searchParams.append('radius', params.radius.toString());
    }

    return this.request(`/search/near-me?${searchParams.toString()}`);
  }

  // User Dashboard APIs
  async getUserDashboard(): Promise<ApiResponse<any>> {
    return this.request(`/user/profile`);
  }

  async updateUserProfile(data: {
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserWishlist(userId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/user/wishlist`);
  }

  async addToWishlist(userId: string, propertyId: string): Promise<ApiResponse> {
    return this.request('/user/add/wishlist', {
      method: 'POST',
      body: JSON.stringify({ userId, propertyId }),
    });
  }

  async removeFromWishlist(userId: string, propertyId: string): Promise<ApiResponse> {
    return this.request('/user/wishlist/delete', {
      method: 'DELETE',
      body: JSON.stringify({ userId, propertyId }),
    });
  }

  // Contact APIs
  async createContact(data: {
    userName: string;
    userPhone: string;
    propertyId: string;
    message?: string;
    contactType?: string;
  }): Promise<ApiResponse> {
    return this.request('/contact/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOwnerContacts(): Promise<ApiResponse<any[]>> {
    return this.request(`/contact/owner/contacts`);
  }

  async deleteContact(contactId: string): Promise<ApiResponse> {
    return this.request(`/contact/contact/${contactId}/owner/delete`, {
      method: 'DELETE',
    });
  }

  // User Contact APIs
  async getUserContacts(): Promise<ApiResponse<any[]>> {
    return this.request(`/contact/user/contacts`);
  }

  async deleteUserContact(contactId: string): Promise<ApiResponse> {
    return this.request(`/contact/contact/${contactId}/user/delete`, {
      method: 'DELETE',
    });
  }

  // Temporary Mobile Preverification APIs (for contact number during listing)
  async sendMobileOtp(mobile: string): Promise<ApiResponse<{ otp: number }>> {
    return this.request('/preverify/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyMobileOtp(mobile: string, otp: number): Promise<ApiResponse> {
    return this.request('/preverify/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type { User, Owner , ApiResponse };
