"use client";
import { Button } from '../../components/ui/button';
import { Home, Plus } from 'lucide-react';
import Link from 'next/link';

interface ListPropertyCTAProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const ListPropertyCTA = ({ variant = 'default', className = '' }: ListPropertyCTAProps) => {
  if (variant === 'compact') {
    return (
      <Link href="/signup?type=owner" className={className}>
        <Button size="sm" className="btn-hero">
          <Plus className="w-4 h-4 mr-2" />
          + List Your Property
        </Button>
      </Link>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-center ${className}`}>
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
        <Home className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Own a Property?</h3>
      <p className="text-white/90 mb-4">Join thousands of owners earning monthly income</p>
      <Link href="/signup?type=owner">
        <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
          <Plus className="w-5 h-5 mr-2" />
          + List Your Property
        </Button>
      </Link>
    </div>
  );
};

export default ListPropertyCTA;