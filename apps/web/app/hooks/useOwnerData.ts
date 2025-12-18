"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient, Owner } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'

export type PropertyStatus = 'ACTIVE' | 'PAUSED' | 'DELETED'
export type PropertyType = 'ROOM' | 'PG' | 'FLAT' | 'PLOT' | 'HOURLY_ROOM'

export type Property = {
  id: string
  title: string
  type: PropertyType
  rent: number
  location: string
  description?: string
  image: string
  images?: string[]
  status: PropertyStatus
  createdAt: string
  views: number
  isVerified?: boolean
  isAvailable?: boolean
  isDraft?: boolean
  contactCount?: number
  city?: string
  townSector?: string
  bhk?: number
  furnished?: string
}

export type Lead = {
  id: string
  propertyId: string
  propertyTitle?: string
  seekerName: string
  seekerEmail?: string
  seekerPhone: string
  message: string
  status: 'NEW' | 'CONTACTED' | 'CLOSED'
  createdAt: string
  contactType?: string
}

export function useOwnerData() {
  const { user, owner, setOwner } = useAuth()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOwnerProfile = useCallback(async () => {
    if (!user || user.role !== 'OWNER') return;
    setIsLoading(true);
    try {
      const response = await apiClient.getOwnerProfile();
      if (response.success && response.data) {
        setOwner(response.data as Owner);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load owner profile');
    } finally {
      setIsLoading(false);
    }
  }, [user, setOwner]);

  // Load owner properties from API
  const loadProperties = useCallback(async () => {
    if (!user?.id) {
      console.log('loadProperties: No user ID found');
      return;
    }
    
    // Check if we have an authentication token
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      console.log('loadProperties: No auth token found');
      setError('Authentication required. Please login again.');
      return;
    }
    
    console.log('loadProperties: Starting API call for user:', user.id, 'with token:', token ? 'present' : 'missing');
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.getOwnerProperties()
      console.log('loadProperties: API response:', response);
      if (response.success && response.data) {
        const formattedProperties: Property[] = response.data.map((prop: any) => ({
          id: prop.id,
          title: prop.title,
          type: prop.propertyType as PropertyType,
          rent: parseInt(prop.rent) || 0,
          location: `${prop.city}${prop.townSector ? ', ' + prop.townSector : ''}`,
          city: prop.city,
          townSector: prop.townSector,
          description: prop.description,
          image: prop.images && prop.images.length > 0 ? prop.images[0] : '/placeholder.svg',
          images: prop.images || [],
          status: prop.isDraft ? 'PAUSED' : prop.isAvailable ? 'ACTIVE' : 'PAUSED',
          createdAt: prop.createdAt,
          views: prop.contactCount || 0,
          isVerified: prop.isVerified,
          isAvailable: prop.isAvailable,
          isDraft: prop.isDraft,
          contactCount: prop.contactCount,
          bhk: prop.bhk,
          furnished: prop.furnished
        }))
        setProperties(formattedProperties)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load properties')
      console.error('Failed to load properties:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Load owner contacts/leads from API
  const loadLeads = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const response = await apiClient.getOwnerContacts()
      
      if (response.success && response.data) {
        const formattedLeads: Lead[] = response.data.map((contact: any) => ({
          id: contact.id,
          propertyId: contact.propertyId,
          propertyTitle: contact.property?.title || 'Property',
          seekerName: contact.userName,
          seekerEmail: '',
          seekerPhone: contact.userPhone,
          message: contact.message || 'Interested in property',
          status: contact.status || 'NEW',
          createdAt: contact.createdAt,
          contactType: contact.contactType || 'INQUIRY'
        }))
        
        setLeads(formattedLeads)
      }
    } catch (err: any) {
      console.error('Failed to load leads:', err)
    }
  }, [user])

  // Load all data when user changes
  useEffect(() => {
    if (user?.id && user.role === 'OWNER') {
      if (!owner) {
        loadOwnerProfile();
      }
      loadProperties()
      loadLeads()
    }
  }, [user, owner, loadOwnerProfile, loadProperties, loadLeads])

  const totals = useMemo(() => {
    const active = properties.filter(p => p.status === 'ACTIVE' && !p.isDraft)
    const draft = properties.filter(p => p.isDraft)
    const views = properties.reduce((s, p) => s + (p.views || 0), 0)
    const earnings = active.reduce((s, p) => s + p.rent, 0)
    const newLeads = leads.filter(l => l.status === 'NEW').length
    
    return { 
      totalProperties: properties.length,
      activeProperties: active.length,
      draftProperties: draft.length,
      views, 
      leads: leads.length,
      newLeads,
      earnings
    }
  }, [properties, leads])

  const addProperty = useCallback(async (propertyData: {
    title: string;
    type: PropertyType;
    rent: number;
    location: string;
    image?: string;
    description?: string;
  }) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in',
        variant: 'destructive',
      })
      return null
    }
    
    setIsLoading(true)
    try {
      const locationParts = propertyData.location.split(',')
      const city = locationParts[0]?.trim() || propertyData.location
      const townSector = locationParts[1]?.trim() || ''

      const apiData = {
        title: propertyData.title,
        description: propertyData.description || propertyData.title,
        propertyType: propertyData.type,
        city,
        townSector,
        address: propertyData.location,
        rent: propertyData.rent.toString(),
        negotiable: false,
        security: '0',
        maintenance: '0',
        bhk: 1,
        furnished: 'Furnished',
        accommodation: '1',
        totalFloors: 1,
        totalUnits: 1,
        powerBackup: 'Yes',
        waterSupply: '24x7',
        parking: 'Available',
        genderPreference: 'Any',
        preferredTenants: [],
        noticePeriod: '1 month',
        insideAmenities: [],
        outsideAmenities: [],
        contactName: user.name || 'Owner',
        whatsappNo: user.phone || '',
        offer: '',
        type: 'RENT',
        isAvailable: true,
        isDraft: false,
        ownerId: user.id
      }

      const response = await apiClient.createProperty(apiData)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Property created successfully',
        })
        await loadProperties()
        return response.data
      }
    } catch (err: any) {
      console.error('Failed to create property:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to create property',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
    return null
  }, [user, loadProperties, toast])

  const updateProperty = useCallback(async (id: string, patch: Partial<Property>) => {
    setIsLoading(true)
    try {
      const apiData: any = {}
      
      if (patch.title) apiData.title = patch.title
      if (patch.description) apiData.description = patch.description
      if (patch.rent) apiData.rent = patch.rent.toString()
      if (patch.isAvailable !== undefined) apiData.isAvailable = patch.isAvailable
      if (patch.location) {
        const parts = patch.location.split(',')
        apiData.city = parts[0]?.trim()
        apiData.townSector = parts[1]?.trim() || ''
      }

      const response = await apiClient.updateProperty(id, apiData)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Property updated successfully',
        })
        await loadProperties()
      }
    } catch (err: any) {
      console.error('Failed to update property:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to update property',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [loadProperties, toast])

  const deleteProperty = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.deleteProperty(id)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Property deleted successfully',
        })
        await loadProperties()
      }
    } catch (err: any) {
      console.error('Failed to delete property:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete property',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [loadProperties, toast])

  const deleteContact = useCallback(async (contactId: string) => {
    try {
      const response = await apiClient.deleteContact(contactId)
      if (response.success) {
        toast({ title: 'Contact deleted' })
        await loadLeads()
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete contact',
        variant: 'destructive',
      })
    }
  }, [loadLeads, toast])

  const updateOwner = useCallback(async (data: { firstName: string; lastName: string; email: string }) => {
    try {
      const response = await apiClient.updateOwnerProfile(data);
      if (response.success && response.data) {
        setOwner(response.data.owner as Owner);
        toast({ title: 'Success', description: 'Profile updated successfully' });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  }, [setOwner, toast]);

  const togglePropertyAvailability = useCallback(async (propertyId: string) => {
    try {
      const response = await apiClient.togglePropertyAvailability(propertyId)
      if (response.success) {
        toast({
          title: 'Success',
          description: `Property ${response.data?.isAvailable ? 'activated' : 'paused'}`,
        })
        await loadProperties()
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update property',
        variant: 'destructive',
      })
    }
  }, [loadProperties, toast])

  return {
    properties,
    leads,
    totals,
    isLoading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    togglePropertyAvailability,
    deleteContact,
    loadProperties,
    loadLeads,
    updateOwner,
  }
}