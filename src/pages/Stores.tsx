import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Navigation, Phone, Heart, Clock, ChevronDown, X, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string | null;
  opening_hours: any;
  latitude: number | null;
  longitude: number | null;
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Stores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [filterCity, setFilterCity] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      const { data } = await supabase.from("stores").select("*").eq("is_active", true).order("name");
      if (data) setStores(data);
      setIsLoading(false);
    };
    fetchStores();
  }, []);

  // Request location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError("Location access denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const cities = useMemo(() => [...new Set(stores.map((s) => s.city))].sort(), [stores]);

  const storesWithDistance = useMemo(() => {
    return stores.map((store) => {
      const distance = userLocation && store.latitude && store.longitude
        ? haversineDistance(userLocation.lat, userLocation.lng, store.latitude, store.longitude)
        : null;
      return { ...store, distance };
    });
  }, [stores, userLocation]);

  const filteredStores = useMemo(() => {
    let result = storesWithDistance.filter((store) => {
      const matchesSearch =
        !searchQuery ||
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = filterCity === "all" || store.city === filterCity;
      return matchesSearch && matchesCity;
    });

    // Sort by distance if available, else alphabetical
    result.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [storesWithDistance, searchQuery, filterCity]);

  const toggleFavorite = (storeId: string) => {
    setFavorites((prev) => prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]);
  };

  const openDirections = useCallback((store: Store) => {
    if (store.latitude && store.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
      window.open(url, "_blank");
    } else {
      const encoded = encodeURIComponent(`${store.address}, ${store.city}, ${store.province}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
    }
  }, []);

  const openInMaps = useCallback((store: Store) => {
    if (store.latitude && store.longitude) {
      // Try native maps on mobile
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.open(`maps://maps.apple.com/?daddr=${store.latitude},${store.longitude}`, "_blank");
      } else {
        window.open(`geo:${store.latitude},${store.longitude}?q=${store.latitude},${store.longitude}(${encodeURIComponent(store.name)})`, "_blank");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl tracking-wide text-foreground">STORES</h1>
              <p className="text-sm text-muted-foreground">
                {userLocation ? `${filteredStores.length} locations found` : "Find a location near you"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                Filter
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by city or store..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary border-border" />
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <Button
                variant={filterCity === "all" ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilterCity("all")}
                className={filterCity === "all" ? "btn-gold shrink-0" : "shrink-0"}
              >
                All Cities
              </Button>
              {cities.map((city) => (
                <Button
                  key={city}
                  variant={filterCity === city ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setFilterCity(city)}
                  className={filterCity === city ? "btn-gold shrink-0" : "shrink-0"}
                >
                  {city}
                </Button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Map Section */}
      <div ref={mapRef} className="h-56 bg-secondary/50 relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          {/* Simple visual map representation */}
          <div className="w-full h-full relative bg-muted/30">
            {/* Grid lines for map feel */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />

            {/* Store pins */}
            {filteredStores.map((store) => {
              if (!store.latitude || !store.longitude) return null;
              // Simple projection for SA stores
              const x = ((store.longitude - 17) / (33 - 17)) * 100;
              const y = ((store.latitude - (-22)) / ((-35) - (-22))) * 100;
              const isSelected = selectedStore?.id === store.id;
              return (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`absolute transform -translate-x-1/2 -translate-y-full transition-all ${isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"}`}
                  style={{ left: `${Math.min(Math.max(x, 5), 95)}%`, top: `${Math.min(Math.max(y, 10), 90)}%` }}
                >
                  <div className={`flex flex-col items-center ${isSelected ? "text-accent" : "text-foreground"}`}>
                    <MapPin className={`w-6 h-6 ${isSelected ? "fill-accent text-accent" : "fill-primary text-primary"}`} />
                    <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap bg-background/80 px-1 rounded">
                      {store.name.replace("Bogart Man ", "")}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* User location dot */}
            {userLocation && (
              <div
                className="absolute w-3 h-3 bg-accent rounded-full border-2 border-background shadow-lg z-30 animate-pulse"
                style={{
                  left: `${Math.min(Math.max(((userLocation.lng - 17) / (33 - 17)) * 100, 5), 95)}%`,
                  top: `${Math.min(Math.max(((userLocation.lat - (-22)) / ((-35) - (-22))) * 100, 10), 90)}%`,
                }}
              />
            )}

            {locationError && !userLocation && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <Badge variant="secondary" className="text-xs">{locationError}</Badge>
              </div>
            )}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Selected Store Card (overlay) */}
      {selectedStore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 -mt-6 relative z-30 card-premium rounded-xl p-4 border border-border shadow-lg"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-display text-lg tracking-wide text-foreground">{selectedStore.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedStore.address}, {selectedStore.city}</p>
              {(selectedStore as any).distance != null && (
                <p className="text-xs text-accent font-medium mt-1">{((selectedStore as any).distance as number).toFixed(1)} km away</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedStore(null)} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1 gap-2" onClick={() => openDirections(selectedStore)}>
              <Navigation className="w-4 h-4" />Directions
            </Button>
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => openInMaps(selectedStore)}>
              <ExternalLink className="w-4 h-4" />Maps
            </Button>
            {selectedStore.phone && (
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => window.open(`tel:${selectedStore.phone}`)}>
                <Phone className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      )}

      <main className="px-5 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium rounded-xl p-4 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-8 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">
              {stores.length === 0 ? "No stores available yet" : "No stores found matching your search"}
            </p>
            {(searchQuery || filterCity !== "all") && (
              <Button variant="ghost" onClick={() => { setSearchQuery(""); setFilterCity("all"); }} className="mt-4 text-accent">Clear filters</Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredStores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card-premium rounded-xl p-4 cursor-pointer transition-all ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}
                onClick={() => setSelectedStore(store)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg tracking-wide text-foreground">{store.name}</h3>
                      {store.distance != null && (
                        <Badge variant="secondary" className="text-[10px]">{store.distance.toFixed(1)} km</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{store.address}, {store.city}, {store.province}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFavorite(store.id); }} className="shrink-0">
                    <Heart className={`w-5 h-5 ${favorites.includes(store.id) ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1 gap-2" onClick={(e) => { e.stopPropagation(); openDirections(store); }}>
                    <Navigation className="w-4 h-4" />Directions
                  </Button>
                  {store.phone && (
                    <Button variant="secondary" size="sm" className="gap-2" onClick={(e) => { e.stopPropagation(); window.open(`tel:${store.phone}`); }}>
                      <Phone className="w-4 h-4" />Call
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Stores;
