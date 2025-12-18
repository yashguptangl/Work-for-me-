"use client"

import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'

export type UserActivity = {
  id: string
  type: 'search' | 'contacted' | 'shortlisted'
  text: string
  date: string
  propertyId?: string
}

export type WishlistItem = {
  id: string
  propertyId: string
  property: Property
  createdAt: string
}

export type ContactItem = {
  id: string
  propertyId: string
  property?: Property
  userName: string
  userPhone: string
  contactType: string
  status: string
  message?: string
  createdAt: string
}

export type Property = {
  id: string
  title: string
  type: string
  rent: number
  location: string
  image: string
  images?: string[]
  description?: string
  bhk?: number
  furnished?: string
  isVerified?: boolean
  isAvailable?: boolean
  city?: string
  townSector?: string
}

export function useUserData() {
  const { user } = useAuth()
  const isSeeker = user?.role === 'SEEKER'
  const { toast } = useToast()
  const [recentProperties, setRecentProperties] = useState<Property[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error] = useState<string | null>(null);

  // Load recent properties
  const loadRecentProperties = useCallback(async () => {
    if (!isSeeker) return

    try {
      const response = await apiClient.getAllProperties()
      
      if (response.success && response.data) {
        const formatted: Property[] = response.data.slice(0, 6).map((prop: any) => ({
          id: prop.id,
          title: prop.title,
          type: prop.propertyType,
          rent: parseInt(prop.rent),
          location: `${prop.city}${prop.townSector ? ', ' + prop.townSector : ''}`,
          image: prop.images?.[0] || '/placeholder.svg',
          images: prop.images,
          description: prop.description,
          bhk: prop.bhk,
          furnished: prop.furnished,
          isVerified: prop.isVerified,
          isAvailable: prop.isAvailable,
          city: prop.city,
          townSector: prop.townSector
        }))
        
        setRecentProperties(formatted)
      }
    } catch (err: any) {
      console.error('Failed to load recent properties:', err)
    }
  }, [isSeeker])

  // Load wishlist
  const loadWishlist = useCallback(async () => {
    if (!user?.id || !isSeeker) {
      console.log('loadWishlist: No user ID or not seeker');
      return;
    }

    // Check if we have an authentication token
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      console.log('loadWishlist: No auth token found');
      return;
    }

    console.log('loadWishlist: Starting API call for user:', user.id, 'with token:', token ? 'present' : 'missing');
    setIsLoading(true)
    try {
      const response = await apiClient.getUserWishlist(user.id)
      console.log('loadWishlist: API response:', response);
      
      if (response.success && response.data) {
        // Backend returns { data: { wishlist: [...] } }
        const wishlistData = (response.data as any).wishlist || response.data
        
        // Format the wishlist items
        const formattedWishlist = Array.isArray(wishlistData) ? wishlistData.map((item: any) => ({
          id: item.id || item.property?.id,
          propertyId: item.property?.id || item.id,
          property: {
            id: item.property?.id,
            title: item.property?.title,
            type: item.property?.propertyType,
            rent: parseInt(item.property?.rent || 0),
            location: `${item.property?.city || ''}${item.property?.townSector ? ', ' + item.property.townSector : ''}`.trim() || 'Location not available',
            image: item.property?.imageUrl || item.property?.coverImage || '/placeholder.svg',
            city: item.property?.city,
            townSector: item.property?.townSector,
            isAvailable: item.property?.isAvailable
          },
          createdAt: item.createdAt || new Date().toISOString()
        })) : []
        
        setWishlist(formattedWishlist)
      }
    } catch (err: any) {
      console.error('Failed to load wishlist:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, isSeeker])

  // Load contacts
  const loadContacts = useCallback(async () => {
    if (!user?.id || !isSeeker) {
      console.log('loadContacts: No user ID or not seeker');
      return;
    }

    // Check if we have an authentication token
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      console.log('loadContacts: No auth token found');
      return;
    }

    console.log('loadContacts: Starting API call with token:', token ? 'present' : 'missing');
    try {
      const response = await apiClient.getUserContacts()
      console.log('loadContacts: API response:', response);
      
      if (response.success && response.data) {
        const formattedContacts: ContactItem[] = response.data.map((contact: any) => ({
          id: contact.id,
          propertyId: contact.propertyId,
          property: contact.property ? {
            id: contact.property.id,
            title: contact.property.title,
            type: contact.property.propertyType,
            rent: parseInt(contact.property.rent),
            location: `${contact.property.city}${contact.property.townSector ? ', ' + contact.property.townSector : ''}`,
            image: '/placeholder.svg',
            city: contact.property.city,
            townSector: contact.property.townSector,
            isAvailable: contact.property.isAvailable
          } : undefined,
          userName: contact.userName,
          userPhone: contact.userPhone,
          contactType: contact.contactType || 'INQUIRY',
          status: contact.status || 'NEW',
          message: contact.message,
          createdAt: contact.createdAt
        }))
        
        setContacts(formattedContacts)
      }
    } catch (err: any) {
      console.error('Failed to load contacts:', err)
    }
  }, [user?.id, isSeeker])

  // Load activities from localStorage
  const loadActivities = useCallback(() => {
    try {
      const stored = localStorage.getItem('user_activities')
      if (stored) {
        setActivities(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load activities:', err)
    }
  }, [])

  // Add activity
  const addActivity = useCallback((activity: Omit<UserActivity, 'id' | 'date'>) => {
    const newActivity: UserActivity = {
      ...activity,
      id: Date.now().toString(),
      date: new Date().toISOString()
    }
    
    setActivities(prev => {
      const updated = [newActivity, ...prev].slice(0, 10)
      try {
        localStorage.setItem('user_activities', JSON.stringify(updated))
      } catch (err) {
        console.error('Failed to save activity:', err)
      }
      return updated
    })
  }, [])

  // Initial data load
  useEffect(() => {
    if (user?.id && isSeeker) {
      loadWishlist()
      loadContacts()
      loadActivities()
    }
  }, [user?.id, isSeeker, loadWishlist, loadContacts, loadActivities])

  // Add to wishlist
  const addToWishlist = useCallback(async (propertyId: string) => {
    if (!user?.id) {
      toast({
        title: 'Login Required',
        description: 'Please login to save properties',
        variant: 'destructive'
      })
      return false
    }

    try {
      const response = await apiClient.addToWishlist(user.id, propertyId)
      
      if (response.success) {
        toast({
          title: 'Added to Wishlist',
          description: 'Property saved successfully'
        })
        
        await loadWishlist()
        addActivity({
          type: 'shortlisted',
          text: 'Added property to wishlist',
          propertyId
        })
        
        return true
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add to wishlist',
        variant: 'destructive'
      })
    }
    return false
  }, [user?.id, loadWishlist, addActivity, toast])

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (propertyId: string) => {
    if (!user?.id) return false

    try {
      const response = await apiClient.removeFromWishlist(user.id, propertyId)
      
      if (response.success) {
        toast({
          title: 'Removed from Wishlist',
          description: 'Property removed successfully'
        })
        
        await loadWishlist()
        return true
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove from wishlist',
        variant: 'destructive'
      })
    }
    return false
  }, [user?.id, loadWishlist, toast])

  // Create contact
  const createContact = useCallback(async (propertyId: string, message?: string) => {
    if (!user?.id || !user?.name || !user?.phone) {
      toast({
        title: 'Login Required',
        description: 'Please login to contact owners',
        variant: 'destructive'
      })
      return false
    }

    try {
      const response = await apiClient.createContact({
        userName: user.name,
        userPhone: user.phone,
        propertyId,
        contactType: 'INQUIRY',
        message: message || 'Interested in this property'
      })
      
      if (response.success) {
        toast({
          title: '📞 Contact Request Sent!',
          description: 'Property owner will contact you soon via WhatsApp or call'
        })
        
        await loadContacts()
        addActivity({
          type: 'contacted',
          text: 'Contacted property owner',
          propertyId
        })
        
        return true
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to send contact',
        variant: 'destructive'
      })
    }
    return false
  }, [user?.id, user?.name, user?.phone, loadContacts, addActivity, toast])

  // Delete contact
  const deleteContact = useCallback(async (contactId: string) => {
    if (!user?.id) return false
    
    try {
      const response = await apiClient.deleteUserContact(contactId)
      if (response.success) {
        toast({
          title: 'Contact Deleted',
          description: 'Contact removed from history'
        })
        await loadContacts()
        return true
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete contact',
        variant: 'destructive'
      })
    }
    return false
  }, [user?.id, loadContacts, toast])

  return {
    recentProperties,
    wishlist,
    contacts,
    activities,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    addActivity,
    createContact,
    deleteContact,
    loadRecentProperties,
    loadWishlist,
    loadContacts
  }
}
