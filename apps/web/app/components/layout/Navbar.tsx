
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { Button } from '../../components/ui/button';
import { Home, Search, User, Menu, X, Shield, Building2, Heart, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';
import NavImage from '@/assets/logo_with_name.png'
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Base nav items rendered for SSR and initial client render (stable)
  const baseNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About Us', path: '/about', icon: Shield },
    { name: 'Pricing', path: '/pricing', icon: Building2 },
    { name: 'Guides'  , path: '/guides', icon: Search },
  ];


  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Force re-render when user state changes
  useEffect(() => {
    console.log('Navbar: User state updated', user);
  }, [user]);

  // Listen for storage changes to update navbar immediately after login
  useEffect(() => {
    const handleStorageChange = () => {
      // Force component to re-check user state
      setMounted(false);
      setTimeout(() => setMounted(true), 0);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <nav key={user?.id || 'no-user'} className={`sticky top-0 z-[60] bg-white border-b border-border transition-all ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all ${isScrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {/* Site Logo */}
            <div className="flex items-center">
              <Image src={NavImage.src} alt="roomkarts" className="h-10 sm:h-12 w-auto object-contain" width={200} height={50} />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Home first */}

            <Link
              href="/"
              className={`nav-link ${isActive('/') ? 'text-primary' : 'text-foreground'}`}
            >
              Home
            </Link>

            {/* Remaining items */}
            {baseNavItems.filter(i => i.name !== 'Home').map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`nav-link ${isActive(item.path) ? 'text-primary' : 'text-foreground'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons (SSR-stable: render after mount) */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-3 relative">
            {!mounted ? (
              <div className="w-24 sm:w-32 h-10 bg-gray-100 animate-pulse rounded"></div>
            ) : !user ? (
              <>
                <Link href="/login?type=owner" className="hidden sm:inline-block">
                  <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                    <Button variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 text-xs sm:text-sm px-2 sm:px-3 font-medium shadow-sm">
                      Post Property Free
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/login">
                  <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                    <Button size="sm" className="btn-hero py-2 px-3 sm:px-4 text-xs sm:text-sm">Sign In</Button>
                  </motion.div>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name ?? ''}`}
                        alt={`${user.name ?? 'User'}`}
                      />
                      <AvatarFallback>
                        {(user.name ?? 'U').slice(0,1)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white text-black border border-gray-200 shadow-lg z-[100]" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal bg-white text-black">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-black">{user.name}</p>
                      <p className="text-xs leading-none text-gray-600">
                        {user.email}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        {user.role === 'OWNER' ? 'Property Owner' : 'Property Seeker'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  
                  {/* Owner Dropdown */}
                  {user.role === 'OWNER' && (
                    <>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/owner/dashboard" className="text-black">
                          <Home className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/owner/profile" className="text-black">
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/list-property" className="text-black">
                          <Building2 className="mr-2 h-4 w-4" />
                          Add Property
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/rent-agreements" className="text-black">
                          <FileText className="mr-2 h-4 w-4" />
                          Rent Agreements
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* User/Seeker Dropdown */}
                  {user.role === 'SEEKER' && (
                    <>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/user/dashboard" className="text-black">
                          <Search className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/user/profile" className="text-black">
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/properties" className="text-black">
                          <Home className="mr-2 h-4 w-4" />
                          Browse Properties
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/user/dashboard" className="text-black">
                          <Heart className="mr-2 h-4 w-4" />
                          My Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="bg-white text-black hover:bg-gray-100">
                        <Link href="/rent-agreements" className="text-black">
                          <FileText className="mr-2 h-4 w-4" />
                          Rent Agreements
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onClick={logout} className="bg-white text-black hover:bg-gray-100">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button - Hidden on small screens, visible on md+ */}
          <motion.button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu - Hidden on small screens */}
        <div className="hidden md:block lg:hidden">
          <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={mounted ? user : null} onLogout={logout} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;