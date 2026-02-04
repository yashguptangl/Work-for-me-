"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useUserData } from '@/hooks/useUserData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MapPin, MessageSquare, Trash2 } from 'lucide-react'
import Image from 'next/image'
import heroProperty from '@/assets/hero-property.jpg'

export default function UserDashboard() {
  const { user, requireRole } = useAuth()
  const router = useRouter()
  const {
    wishlist,
    contacts,
    isLoading,
    removeFromWishlist,
    deleteContact,
  } = useUserData()


  // Protect route - only seeker role can access
  useEffect(() => {
    const u = requireRole(['SEEKER'])
    if (!u) {
      router.replace('/login')
    }
  }, [requireRole, router])

  const handleRemoveFromWishlist = async (propertyId: string) => {
    await removeFromWishlist(propertyId)
  }

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Remove this contact from history?')) {
      await deleteContact(contactId)
    }
  }

  const handleViewProperty = (propertyId: string) => {
    router.push(`/properties/${propertyId}`)
  }

  const [initials, setInitials] = useState('RD')

  useEffect(() => {
    if (!user?.name) {
      setInitials('RD')
    } else {
      const computed = user.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
      setInitials(computed)
    }
  }, [user?.name])

  const hasLoadedData = Array.isArray(wishlist) && wishlist.length > 0 || Array.isArray(contacts) && contacts.length > 0

  if (isLoading && !hasLoadedData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-slate-500">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 md:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-8 px-2 sm:px-3 md:px-6 lg:px-0">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16">
                <AvatarImage src={undefined} alt={user?.name ?? 'User avatar'} />
                <AvatarFallback className="bg-slate-100 text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-slate-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-2xl font-semibold text-slate-900 truncate">
                  Welcome, {user?.name?.split(' ')[0] ?? 'seeker'}
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs md:text-sm text-slate-500 line-clamp-1">
                  Track homes you love
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-2 md:mt-0">
              <Button 
                onClick={() => {
                  const contactSection = document.getElementById('contact-section');
                  contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                variant="outline"
                className="w-full sm:w-auto text-[10px] sm:text-xs md:text-sm h-8 sm:h-9 md:hidden" 
                size="sm"
              >
                <MessageSquare className="h-3 w-3 mr-1.5" />
                Jump to Contacts
              </Button>
              <Button onClick={() => router.push('/properties')} className="w-full sm:w-auto text-[10px] sm:text-xs md:text-sm h-8 sm:h-9" size="sm">
                Browse homes
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-2 sm:p-3 md:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg text-slate-900">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-rose-500" /> Saved homes
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs md:text-sm text-slate-500">
                Revisit listings you saved for quick comparison and follow-up.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 p-2 sm:p-3 md:p-4 lg:p-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex animate-pulse gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="h-20 w-24 rounded-lg bg-slate-200" />
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="h-4 w-1/2 rounded bg-slate-200" />
                        <div className="h-3 w-1/3 rounded bg-slate-200" />
                        <div className="flex gap-2">
                          <div className="h-9 w-24 rounded bg-slate-200" />
                          <div className="h-9 w-9 rounded bg-slate-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !Array.isArray(wishlist) || wishlist.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 sm:p-8 md:p-10 text-center text-slate-500">
                  <Heart className="mx-auto mb-2 sm:mb-3 h-6 w-6 sm:h-8 sm:w-8 text-rose-300" />
                  <p className="font-medium text-xs sm:text-sm md:text-base text-slate-600">No saved homes yet</p>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">Shortlist listings to keep them handy here.</p>
                  <Button className="mt-3 sm:mt-4 md:mt-5 text-[10px] sm:text-xs md:text-sm h-8 sm:h-9" onClick={() => router.push('/properties')}>
                    Discover properties
                  </Button>
                </div>
              ) : (
                wishlist.map(item => (
                  <div key={item.id} className="flex gap-2 sm:gap-3 md:gap-4 rounded-xl border border-slate-100 bg-white p-2 sm:p-3 md:p-4 shadow-sm transition hover:border-slate-200">
                    <div className="h-14 w-16 sm:h-16 sm:w-20 md:h-20 md:w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 relative">
                      <Image 
                        src={item.property.image || heroProperty.src} 
                        alt={item.property.title} 



                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 sm:gap-2 md:gap-3 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-xs sm:text-sm md:text-base text-slate-900 line-clamp-1">{item.property.title}</p>
                            <Badge 
                              variant="secondary" 
                              className={`text-[9px] sm:text-[10px] h-4 ${
                                item.property.listingType === 'SALE' 
                                  ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                  : 'bg-green-100 text-green-700 border-green-300'
                              }`}
                            >
                              {item.property.listingType === 'SALE' ? 'Buy/Sell' : 'Rent'}
                            </Badge>
                          </div>
                          <p className="mt-0.5 sm:mt-1 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm text-slate-500">
                            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{item.property.location}</span>
                          </p>
                        </div>
                        <span className="rounded-full bg-rose-50 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs md:text-sm font-medium text-rose-600 w-fit flex-shrink-0">
                          ₹{(item.property.listingType === 'SALE' ? item.property.salePrice : item.property.rent)?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2">
                        <Button size="sm" className="flex-1 text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-2 sm:px-3" onClick={() => handleViewProperty(item.propertyId)}>
                          View details
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 sm:h-8 md:h-9 px-1.5 sm:px-2 md:px-3" onClick={() => handleRemoveFromWishlist(item.propertyId)}>
                          <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card id="contact-section" className="border border-slate-200 bg-white shadow-sm scroll-mt-20">
            <CardHeader className="p-2 sm:p-3 md:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg text-slate-900">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-sky-500" /> Recent contacts
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs md:text-sm text-slate-500">
                Keep a record of the owners and agents you&apos;ve reached out to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 p-2 sm:p-3 md:p-4 lg:p-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex animate-pulse flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="h-3 w-1/2 rounded bg-slate-200" />
                      <div className="h-3 w-1/3 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : !Array.isArray(contacts) || contacts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 sm:p-8 md:p-10 text-center text-slate-500">
                  <MessageSquare className="mx-auto mb-2 sm:mb-3 h-6 w-6 sm:h-8 sm:w-8 text-sky-400" />
                  <p className="font-medium text-xs sm:text-sm md:text-base text-slate-600">No conversations yet</p>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">When you contact an owner, the details will show here.</p>
                </div>
              ) : (
                contacts.map(contact => (
                  <div key={contact.id} className="space-y-1.5 sm:space-y-2 md:space-y-3 rounded-xl border border-slate-100 bg-white p-2 sm:p-3 md:p-4 shadow-sm">
                    <div className="flex flex-col gap-0.5 sm:gap-1 md:gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[10px] sm:text-xs md:text-sm text-slate-500">Owner contacted</p>
                        {contact.property && (
                          <Badge 
                            variant="secondary" 
                            className={`text-[9px] sm:text-[10px] h-4 ${
                              contact.property.listingType === 'SALE' 
                                ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                : 'bg-green-100 text-green-700 border-green-300'
                            }`}
                          >
                            {contact.property.listingType === 'SALE' ? 'Buy/Sell' : 'Rent'}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-xs sm:text-sm md:text-base text-slate-900 line-clamp-1">{contact.property?.title ?? 'Listing unavailable'}</p>
                      <p className="flex items-center gap-0.5 sm:gap-1 md:gap-2 text-[10px] sm:text-xs md:text-sm text-slate-500">
                        <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{contact.property?.location ?? 'Location not shared'}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-[10px] sm:text-xs md:text-sm text-slate-600">
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-sky-500" />
                        {contact.contactType}
                      </span>
                      <span>Status: {contact.status}</span>
                      <span>{new Date(contact.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {contact.userPhone && <span className="hidden md:inline">Phone: {contact.userPhone}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-2 sm:px-3" onClick={() => contact.property && handleViewProperty(contact.propertyId)} disabled={!contact.property}>
                        View listing
                      </Button>
                      <Button size="sm" variant="ghost" className="text-rose-500 text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-1.5 sm:px-2 md:px-3" onClick={() => handleDeleteContact(contact.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}