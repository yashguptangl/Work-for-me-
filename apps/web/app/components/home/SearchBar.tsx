"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Navigation } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ComboBox from "@/components/ui/ComboBox";
import { citiesData } from "@/lib/cities";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

const TABS = ["Rent"] as const;

export type SearchBarProps = {
  defaultTab?: typeof TABS[number];
  onSearch?: (params: { tab: string; category: string; q: string; city: string; sector: string }) => void;
};

export default function SearchBar({ defaultTab = "Rent", onSearch }: SearchBarProps) {
  const router = useRouter();
  const [active, setActive] = useState<typeof TABS[number]>(defaultTab);
  const [category, setCategory] = useState("all");
  const [q] = useState("");
  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");

  const handleSearch = () => {
    if (!city || !sector) {
      toast.error('⚠️ Required Fields Missing', {
        description: 'Please select both city and area to search properties'
      });
      return;
    }
    
    if (q.trim() === '' && category === 'all') {
      toast.info('🔍 Broad Search', {
        description: 'Searching all residential properties in your selected area'
      });
    }
    
    onSearch?.({ tab: active, category, q, city, sector });
  };

  const handleNearMeClick = async () => {
    console.log('🔍 Near Me button clicked - searching all properties');

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

        // Navigate to properties page with Near Me params (all properties)
        const params = new URLSearchParams({
          nearMe: 'true',
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          allResidential: 'true'
        });

        console.log('🚀 Navigating to /properties with params:', params.toString());
        router.push(`/properties?${params.toString()}`);
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        toast.error('Failed to get your location. Please enable location services.', { id: toastId });
      }
    );
  };

  const cityOptions = Object.keys(citiesData);
  const sectorOptions = city ? (citiesData[city] ?? []) : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 -mt-4 sm:-mt-6 md:-mt-8 lg:-mt-10"
    >
      <div className="mx-auto max-w-5xl px-3 sm:px-4 md:px-6">
        <div className="rounded-xl sm:rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          {/* Tabs */}
          <div className="px-3 sm:px-4 pt-2 sm:pt-3">
            <Tabs value={active} onValueChange={(v) => setActive(v as typeof active)}>
              <div className="overflow-x-auto -mx-2 px-2">
                <TabsList className="h-9 sm:h-11 bg-transparent flex sm:grid sm:grid-cols-6 gap-1 whitespace-nowrap">
                  {TABS.map((t) => (
                    <TabsTrigger
                      key={t}
                      value={t}
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </div>

          {/* Search Row */}
          <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4">
            <div className="flex flex-col md:flex-row gap-2 sm:gap-3 items-stretch">
              {/* Category */}
              <div className="md:w-[220px]">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base">
                    <SelectValue placeholder="All Residential" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Residential</SelectItem>
                    <SelectItem value="rooms">Rooms</SelectItem>
                    <SelectItem value="pgs">PGs</SelectItem>
                    <SelectItem value="flats">Flats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* City ComboBox */}
              <div className="flex-1">
                <ComboBox options={cityOptions} placeholder="Select City" onChange={setCity} />
              </div>

              {/* Town / Sector ComboBox */}
              <div className="flex-1">
                <ComboBox options={sectorOptions} placeholder="Select Town / Sector" onChange={setSector} />
              </div>

              {/* Search Button */}
              <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} className="w-full md:w-auto">
                <Button onClick={handleSearch} className="h-10 sm:h-12 w-full rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base">
                  <SearchIcon className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  Search
                </Button>
              </motion.div>
            </div>

            {/* Near Me Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleNearMeClick}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 rounded-lg sm:rounded-xl text-blue-600 border-blue-600 hover:bg-blue-50 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                Near Me
              </Button>
            </div>
          </div>
        </div>
      </div>


    </motion.section>
  );
}
