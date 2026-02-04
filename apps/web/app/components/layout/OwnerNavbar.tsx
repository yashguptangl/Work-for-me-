"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { Button } from '../../components/ui/button';
import { Home, User, Menu, X, Briefcase, Plus, Bell, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';
import Image from 'next/image';
import NavImage from '@/assets/logo.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const OwnerNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: Home },
    { name: 'Recent Contacts', path: '/owner/contacts', icon: MessageSquare },
    { name: 'Properties', path: '/owner/properties', icon: Briefcase },
    { name: 'Add Property', path: '/list-property', icon: Plus },
  ];

  const isActive = (path: string) => pathname?.startsWith(path);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <nav className={`sticky top-0 z-[60] bg-white border-b border-border transition-all ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all ${isScrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16'}`}>
          {/* Logo */}
          <Link href="/owner/dashboard" className="flex items-center space-x-2">
            <Image src={NavImage.src} alt="roomkarts" width={32} height={32} className="w-8 h-8 rounded-lg object-contain" />
            <div>
              <span className="text-lg sm:text-xl font-bold text-gradient">Owner Dashboard</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.path) 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex text-gray-600 hover:bg-gray-100"
              onClick={() => router.push('/owner/notifications')}
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={''} alt={user?.name || 'User'} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white text-black border border-gray-200 shadow-lg z-[100]" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal bg-white text-black">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-black">{user?.name || 'User'}</p>
                      <p className="text-xs leading-none text-gray-600">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onClick={() => router.push('/owner/profile')} className="bg-white text-black hover:bg-gray-100">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/owner/settings')} className="bg-white text-black hover:bg-gray-100">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onClick={handleLogout} className="bg-white text-black hover:bg-gray-100">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={mounted ? user : null} onLogout={logout} />
        </div>
      </div>
    </nav>
  );
};

export default OwnerNavbar;
