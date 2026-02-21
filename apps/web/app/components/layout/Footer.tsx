"use client";
import Link from 'next/link';
import { Home, Instagram, Youtube, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Guides', path: '/guides' },
    { name: 'About Us', path: '/about' },
    { name: 'List Property', path: '/list-property' },
    { name: 'Rent Agreement Generator', path: '/rent-agreement' },
    { name: 'Terms & Conditions', path: '/terms-condition' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Payment Refund Policy', path: '/refund-policy' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, url: 'https://x.com' },
    { name: 'YouTube', icon: Youtube, url: 'https://www.youtube.com/@roomkarts_india' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/roomkarts_/' },
  ];

  return (
    <footer className="bg-black text-white mt-20">
      {/* *
       * CHANGED: Replaced 'px-32' with responsive padding (px-6, sm:px-10, etc.)
       *
       */}
      <div className="container mx-auto px-6 sm:px-10 md:px-16 xl:px-32 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo + tagline + paragraph */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">roomkarts</h3>
                <p className="text-xs text-white/70">Verified Rooms. Local Trust.</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Connecting students and young professionals with verified property owners.
              Building trust through verification and local community.
            </p>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label={`Follow us on ${s.name}`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/70 text-sm">
          © 2026 Roomkarts. All rights reserved. Owned and operated by Yash Gupta.
        </div>
      </div>
    </footer>
  );
};

export default Footer;