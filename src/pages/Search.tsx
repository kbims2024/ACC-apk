import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  SearchIcon,
  MapPin,
  Star,
  Briefcase,
  Zap,
  Droplet,
  Hammer,
  Wind,
  Paintbrush,
  ChevronDown,
  Scissors,
  HardHat,
  Grid,
  PenTool,
  Home,
  Heart,
  Navigation,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import {
  COMMON_PROFESSIONS,
  COUNTRIES,
  CITIES_BY_COUNTRY,
  COUNTRY_FLAGS,
} from "../lib/constants";
import CustomSelect from "../components/CustomSelect";
import MapComponent from "../components/MapComponent";

interface Worker {
  _id: string;
  name: string;
  profession: string;
  country?: string;
  location: string;
  rating: number;
  hourlyRate: number;
  entityType?: string;
  companyName?: string;
  photo?: string;
  shortDescription?: string;
  description?: string;
}

const QUICK_CATEGORIES = [
  {
    name: "Plombier",
    icon: Droplet,
    color: "text-blue-500 dark:text-brand-400",
  },
  { name: "Électricien", icon: Zap, color: "text-amber-500" },
  { name: "Menuisier", icon: Hammer, color: "text-accent-600" },
  { name: "Maçon", icon: Briefcase, color: "text-stone-600" },
  {
    name: "Peintre",
    icon: Paintbrush,
    color: "text-brand-500 dark:text-brand-400",
  },
  { name: "Climatisation", icon: Wind, color: "text-cyan-500" },
];

const AIDES_CATEGORIES = [
  { name: "Aide Maçon", icon: HardHat, color: "text-stone-600" },
  {
    name: "Aide Plombier",
    icon: Droplet,
    color: "text-blue-500 dark:text-brand-400",
  },
  { name: "Aide Électricien", icon: Zap, color: "text-amber-500" },
  { name: "Aide Menuisier", icon: Hammer, color: "text-accent-500" },
  {
    name: "Aide Peintre",
    icon: Paintbrush,
    color: "text-brand-500 dark:text-brand-400",
  },
];

const SOUS_TRAITANTS_CATEGORIES = [
  { name: "Sous-traitant BTP", icon: Briefcase, color: "text-stone-700" },
  {
    name: "Sous-traitant Plomberie",
    icon: Droplet,
    color: "text-blue-600 dark:text-brand-400",
  },
  { name: "Sous-traitant Électricité", icon: Zap, color: "text-amber-600" },
  { name: "Sous-traitant Menuiserie", icon: Hammer, color: "text-accent-600" },
  {
    name: "Sous-traitant Peinture",
    icon: Paintbrush,
    color: "text-brand-600 dark:text-brand-400",
  },
];

export default function Search() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCountry, setSearchCountry] = useState("Côte d'Ivoire");
  const [searchLocation, setSearchLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<
    "main" | "aides" | "sous-traitants"
  >("main");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, string>>({});

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("acc_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortByRating, setSortByRating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showSearchModePrompt, setShowSearchModePrompt] = useState(false);

  const handleAutoSearch = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error("Erreur de géocodage");
          const data = await res.json();
          
          let city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state || "";
          let country = data.address.country || "";

          if (country === "Ivory Coast") country = "Côte d'Ivoire";
          if (country === "Senegal") country = "Sénégal";
          if (country === "Cameroon") country = "Cameroun";
          if (country === "Benin") country = "Bénin";
          
          if (city) {
             setSearchLocation(city);
             if (!silent) toast.success(`Localisation trouvée : ${city}`);
          }
          if (country && COUNTRIES.includes(country)) {
             setSearchCountry(country);
          } else if (country) {
             setSearchCountry(country);
          }
          
        } catch (error) {
          console.error(error);
          if (!silent) toast.error("Impossible de déterminer votre ville exacte.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        if (!silent) {
          if (error.code === error.PERMISSION_DENIED) {
             toast.error("Vous devez autoriser la géolocalisation dans votre navigateur.");
          } else {
             toast.error("Erreur lors de la récupération de la position.");
          }
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // Check if geolocation is already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          handleAutoSearch(true);
        } else if (result.state === 'prompt') {
          if (!sessionStorage.getItem("hasAskedSearchMode")) {
            setShowSearchModePrompt(true);
          }
        }
      }).catch(e => {
        console.error(e);
        if (!sessionStorage.getItem("hasAskedSearchMode")) {
          setShowSearchModePrompt(true);
        }
      });
    } else {
      if (!sessionStorage.getItem("hasAskedSearchMode")) {
        setShowSearchModePrompt(true);
      }
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let updatedFavs = [];
      if (favorites.includes(id)) {
        updatedFavs = favorites.filter((fId) => fId !== id);
      } else {
        updatedFavs = [...favorites, id];
      }
      setFavorites(updatedFavs);
      localStorage.setItem("acc_favorites", JSON.stringify(updatedFavs));
    } catch (err) {
      console.error("Erreur localStorage", err);
    }
  };

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on(
      "statusResult",
      (statusMap: Record<string, string>) => {
        setOnlineStatus((prev) => ({ ...prev, ...statusMap }));
      },
    );

    socketRef.current.on(
      "userStatus",
      ({ userId, status }: { userId: string; status: string }) => {
        setOnlineStatus((prev) => ({ ...prev, [userId]: status }));
      },
    );

    fetchWorkers();

    // Fermer le menu si on clique à l'extérieur
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchWorkers = async (overrideTerm?: string) => {
    setLoading(true);
    const termToUse = overrideTerm !== undefined ? overrideTerm : searchTerm;
    try {
      const res = await fetch(
        `/api/users/workers?profession=${termToUse}&country=${searchCountry}&location=${searchLocation}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur API");
      }
      setWorkers(data);
      if (socketRef.current && data.length > 0) {
        socketRef.current.emit(
          "checkStatus",
          data.map((w: any) => w._id),
        );
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setWorkers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [searchCountry, searchLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setIsLocationDropdownOpen(false);
    fetchWorkers();
  };

  const selectProfession = (prof: string) => {
    if (prof === "Tous les métiers") {
      setSearchTerm("");
      fetchWorkers(""); // Search immediately all
    } else {
      setSearchTerm(prof);
      fetchWorkers(prof); // Search immediately
    }
    setIsDropdownOpen(false);
  };

  const selectLocation = (loc: string) => {
    setSearchLocation(loc);
    setIsLocationDropdownOpen(false);
    if (searchTerm) {
      // If we already have a profession, we can trigger search
      // (Wait, actually we should just set it and let user click 'Rechercher' or trigger fetchWorkers(searchTerm, loc) - let's keep it simple: just set it and stay)
      setSearchLocation(loc);
    }
  };

  // Filtrer les suggestions selon la recherche en cours
  const filteredSuggestions = [
    "Tous les métiers",
    ...COMMON_PROFESSIONS.filter((p) =>
      p.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-20"
    >
      {/* Header & Search Bar */}
      <div className="pt-8 pb-4">
        <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Trouver un artisan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">
          Recherchez plus de 10 000 professionnels qualifiés pour vos projets.
        </p>

        <form
          onSubmit={handleSearch}
          className="relative z-20 flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800"
        >
          <div
            className="flex-1 relative flex items-center border-b md:border-b-0 border-slate-100 dark:border-slate-800 pb-2 md:pb-0"
            ref={dropdownRef}
          >
            <SearchIcon className="w-5 h-5 absolute left-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quel métier ? (ex: Peintre...)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full pl-12 pr-4 h-12 bg-transparent text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none"
            />

            {/* Dropdown Auto-complete */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: 0.1 },
                  }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 divide-y divide-slate-50"
                >
                  {filteredSuggestions.length > 0 ? (
                    <div className="p-2 max-h-64 overflow-y-auto">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-2">
                        Suggestions
                      </p>
                      {filteredSuggestions.map((prof, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectProfession(prof)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors text-left"
                        >
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {prof}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                      Aucune suggestion pour "{searchTerm}". Vous pouvez tout de
                      même lancer la recherche.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200 self-center"></div>
          <div className="flex-1 relative flex items-center">
            <MapPin className="w-5 h-5 absolute left-4 text-slate-400 z-10" />
            <CustomSelect
              value={searchCountry}
              onChange={(val) => {
                setSearchCountry(val);
                setSearchLocation("");
              }}
              options={[
                { label: "Tous les pays", value: "" },
                ...COUNTRIES.map((c) => ({
                  label: (
                    <span className="flex items-center gap-2">
                      <img
                        src={COUNTRY_FLAGS[c]}
                        alt={c}
                        className="w-5 h-auto rounded-[2px]"
                      />{" "}
                      {c}
                    </span>
                  ),
                  value: c,
                })),
              ]}
              className="w-full h-12"
              renderTrigger={(selected) => (
                <div className="w-full pl-12 pr-4 h-12 bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none flex items-center justify-between cursor-pointer">
                  <span
                    className={
                      selected && selected.value
                        ? "truncate"
                        : "text-slate-400 truncate"
                    }
                  >
                    {selected && selected.value
                      ? selected.label
                      : "Tous les pays"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                </div>
              )}
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200 self-center"></div>
          <div className="flex-1 relative flex items-center">
            <MapPin className="w-5 h-5 absolute left-4 text-slate-400 z-10" />
            <CustomSelect
              value={searchLocation}
              onChange={(val) => setSearchLocation(val)}
              options={[
                { label: "Toutes les villes", value: "" },
                ...(CITIES_BY_COUNTRY[searchCountry] || []).map((loc) => ({
                  label: loc,
                  value: loc,
                })),
              ]}
              disabled={!searchCountry}
              className="w-full h-12"
              renderTrigger={(selected) => (
                <div
                  className={`w-full pl-12 pr-4 h-12 bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none flex items-center justify-between ${!searchCountry ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <span
                    className={
                      selected && selected.value
                        ? "truncate"
                        : "text-slate-400 truncate"
                    }
                  >
                    {selected && selected.value
                      ? selected.label
                      : "Toutes les villes"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                </div>
              )}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 shrink-0">
            <button
              type="button"
              onClick={handleAutoSearch}
              disabled={isLocating}
              className="h-12 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50"
              title="Trouver autour de moi"
            >
              {isLocating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              )}
            </button>
            <button
              type="submit"
              className="h-12 flex-1 md:flex-none bg-brand-600 text-white px-8 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20 ring-2 ring-accent-400 ring-offset-2"
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Quick Categories Bar (Very visual, easy for users who don't write) */}
        <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              Recherche rapide :
            </p>
            <AnimatePresence mode="wait">
              {activeSubMenu === "aides" ? (
                <motion.div
                  key="aides"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-wrap gap-2 sm:gap-3"
                >
                  <button
                    onClick={() => setActiveSubMenu("main")}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-transparent hover:border-slate-300 dark:border-slate-600 hover:bg-slate-200 rounded-xl transition-all shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90 text-slate-500 dark:text-slate-400" />
                    Retour
                  </button>
                  {AIDES_CATEGORIES.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectProfession(cat.name)}
                      className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 rounded-xl transition-all shadow-sm hover:shadow-md text-sm font-medium text-slate-700 dark:text-slate-200 group focus:outline-none focus:ring-2 focus:ring-brand-500`}
                    >
                      <cat.icon
                        className={`w-4 h-4 transition-colors group-hover:${cat.color} text-slate-400`}
                      />
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              ) : activeSubMenu === "sous-traitants" ? (
                <motion.div
                  key="sous-traitants"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-wrap gap-2 sm:gap-3"
                >
                  <button
                    onClick={() => setActiveSubMenu("main")}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-transparent hover:border-slate-300 dark:border-slate-600 hover:bg-slate-200 rounded-xl transition-all shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90 text-slate-500 dark:text-slate-400" />
                    Retour
                  </button>
                  {SOUS_TRAITANTS_CATEGORIES.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectProfession(cat.name)}
                      className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 rounded-xl transition-all shadow-sm hover:shadow-md text-sm font-medium text-slate-700 dark:text-slate-200 group focus:outline-none focus:ring-2 focus:ring-brand-500`}
                    >
                      <cat.icon
                        className={`w-4 h-4 transition-colors group-hover:${cat.color} text-slate-400`}
                      />
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-wrap gap-2 sm:gap-3"
                >
                  {QUICK_CATEGORIES.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectProfession(cat.name)}
                      className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 rounded-xl transition-all shadow-sm hover:shadow-md text-sm font-medium text-slate-700 dark:text-slate-200 group focus:outline-none focus:ring-2 focus:ring-brand-500`}
                    >
                      <cat.icon
                        className={`w-4 h-4 transition-colors group-hover:${cat.color} text-slate-400`}
                      />
                      {cat.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveSubMenu("aides")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 hover:border-emerald-300 rounded-xl transition-all shadow-sm hover:shadow-md text-sm font-medium text-emerald-800 group focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <HardHat className="w-4 h-4 transition-colors text-emerald-500 group-hover:text-emerald-600" />
                    Aides
                    <ChevronDown className="w-4 h-4 -rotate-90 text-emerald-500 ml-1" />
                  </button>
                  <button
                    onClick={() => setActiveSubMenu("sous-traitants")}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-600 rounded-xl transition-all shadow-sm hover:shadow-md text-sm font-medium text-brand-800 dark:text-brand-400 group focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <Briefcase className="w-4 h-4 transition-colors text-brand-500 group-hover:text-brand-600 dark:text-brand-400" />
                    Sous-traitants
                    <ChevronDown className="w-4 h-4 -rotate-90 text-brand-500 ml-1 dark:text-brand-400" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-shrink-0 pt-8 mt-1 md:mt-0 md:pt-0">
            <div className="flex flex-col sm:flex-row gap-2 mt-0 md:mt-[28px]">
              <button
                onClick={() => setSortByRating(!sortByRating)}
                className={`flex items-center gap-2 px-4 py-2 ${sortByRating ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"} border rounded-xl transition-all shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500`}
              >
                <Star
                  className={`w-4 h-4 ${sortByRating ? "fill-brand-500 text-brand-500" : "text-slate-400"}`}
                />
                Trier par note
              </button>
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`flex items-center gap-2 px-4 py-2 ${showOnlyFavorites ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"} border rounded-xl transition-all shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500`}
              >
                <Heart
                  className={`w-4 h-4 ${showOnlyFavorites ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
                />
                Mes Favoris {favorites.length > 0 && `(${favorites.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Component */}
      <div className="mb-8">
        <MapComponent workers={workers} userLocation={userLocation} />
      </div>

      {/* Results Grid */}
      {loading ? (
        <motion.div 
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-0"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
              }}
              className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 flex flex-col h-[280px] shadow-sm relative overflow-hidden group"
            >
              {/* Shimmer effect overlay */}
              <motion.div 
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-white/5 to-transparent z-10"
                animate={{ translateX: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: i * 0.1 }}
              />
              
              <div className="flex items-start gap-4 mb-5 relative z-0">
                <div className="w-16 h-16 rounded-full bg-slate-200/80 dark:bg-slate-800/80 shrink-0"></div>
                <div className="flex-1 space-y-3 mt-2">
                  <div className="h-4 bg-slate-200/80 dark:bg-slate-800/80 rounded-full w-3/4"></div>
                  <div className="h-3 bg-slate-200/80 dark:bg-slate-800/80 rounded-full w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3 mb-6 flex-1 relative z-0">
                <div className="h-3 bg-slate-200/80 dark:bg-slate-800/80 rounded-full w-full"></div>
                <div className="h-3 bg-slate-200/80 dark:bg-slate-800/80 rounded-full w-full"></div>
                <div className="h-3 bg-slate-200/80 dark:bg-slate-800/80 rounded-full w-4/5"></div>
              </div>
              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 relative z-0">
                <div className="h-9 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl w-24"></div>
                <div className="h-9 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl w-20"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        (() => {
          let displayedWorkers = showOnlyFavorites
            ? workers.filter((w) => favorites.includes(w._id))
            : [...workers];
          if (sortByRating) {
            displayedWorkers.sort((a, b) => b.rating - a.rating);
          }
          return (
            <motion.div
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-0"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
            >
              {displayedWorkers.map((worker) => (
                <motion.div
                  key={worker._id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-brand-100/80 shadow-[0_8px_30px_-6px_rgba(59,130,246,0.12)] hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] hover:border-brand-300 transition-shadow overflow-hidden group z-10 flex flex-col cursor-pointer"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-400 to-brand-600 group-hover:w-2 transition-all duration-300" />
                  <div className="absolute right-0 top-0 w-64 h-64 bg-brand-400/[0.08] blur-3xl rounded-full transform md:translate-x-1/3 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                  <button
                    onClick={(e) => toggleFavorite(e, worker._id)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors group/heart"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${favorites.includes(worker._id) ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover/heart:text-rose-400"}`}
                    />
                  </button>

                  <div className="flex items-start justify-between mb-5 relative z-10 pr-10">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {worker.photo ? (
                          <img
                            src={worker.photo}
                            alt={worker.name}
                            className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-100 dark:border-slate-800"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold text-slate-500 dark:text-slate-400">
                            {worker.companyName
                              ? worker.companyName.charAt(0).toUpperCase()
                              : worker.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {onlineStatus[worker._id] === "online" ? (
                          <span
                            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"
                            title="En ligne"
                          ></span>
                        ) : (
                          <span
                            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900 rounded-full"
                            title="Hors ligne"
                          ></span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                          {worker.entityType === "company" && worker.companyName
                            ? worker.companyName
                            : worker.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {worker.entityType === "company" && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                              Entreprise
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {worker.profession || "Polyvalent"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-sm font-bold flex items-center gap-1 shrink-0 border border-amber-100">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />{" "}
                      {worker.rating > 0 ? worker.rating : "Nouveau"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-100 dark:border-slate-800">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {worker.location
                        ? `${worker.location}, ${worker.country || ""}`
                        : "Non précisé"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-brand-100 dark:border-brand-800 dark:text-brand-400">
                      {worker.hourlyRate
                        ? `${worker.hourlyRate} FCFA / h`
                        : "Sur devis"}
                    </span>
                  </div>

                  {(worker.shortDescription || worker.description) && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        "{worker.shortDescription || worker.description}"
                      </p>
                    </div>
                  )}

                  {worker.videoUrl && (
                    <div className="mb-6 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                      {(() => {
                        const url = worker.videoUrl;
                        if (
                          url.includes("youtube.com/watch?v=") ||
                          url.includes("youtu.be/")
                        ) {
                          const videoId = url.includes("youtube.com")
                            ? url.split("v=")[1]?.split("&")[0]
                            : url.split("youtu.be/")[1]?.split("?")[0];
                          // YouTube iframe doesn't auto-play silently as easily, but we can try mute=1&autoplay=1&loop=1
                          return (
                            <iframe
                              className="w-full aspect-[4/3] md:aspect-video object-cover pointer-events-none"
                              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`}
                              title="Vidéo"
                              allowFullScreen
                              allow="autoplay; encrypted-media"
                            ></iframe>
                          );
                        }
                        if (url.includes("tiktok.com")) {
                          // TikTok doesn't easily embed silently without controls through iframe
                          const videoId = url
                            .split("/video/")[1]
                            ?.split("?")[0];
                          if (videoId)
                            return (
                              <iframe
                                className="w-full aspect-[3/4] md:aspect-[9/16] pointer-events-none"
                                src={`https://www.tiktok.com/embed/v2/${videoId}`}
                                title="Vidéo TikTok"
                              ></iframe>
                            );
                        }
                        // For standard video files (Cloudinary, mp4)
                        return (
                          <video
                            className="w-full aspect-[4/3] md:aspect-video object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            src={url}
                          ></video>
                        );
                      })()}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/worker/${worker._id}?contact=true`}
                      className="text-white bg-brand-600 hover:bg-brand-700 font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-md ring-2 ring-accent-400 ring-offset-2"
                    >
                      Contacter
                    </Link>
                    <Link
                      to={`/worker/${worker._id}`}
                      className="text-brand-600 font-medium text-sm group-hover:underline flex items-center gap-1 dark:text-brand-400"
                    >
                      Voir le profil complet{" "}
                      <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">
                        -&gt;
                      </span>
                    </Link>
                  </div>
                </motion.div>
              ))}
              {displayedWorkers.length === 0 && !loading && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-600">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <SearchIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Aucun artisan trouvé
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    {showOnlyFavorites
                      ? "Vous n'avez pas encore d'artisans favoris pour cette recherche."
                      : "Nous n'avons pas trouvé de prestataire pour \"" +
                        searchTerm +
                        '". Essayez une autre catégorie ou retirez la localisation.'}
                  </p>

                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSearchLocation("");
                        fetchWorkers("");
                        setShowOnlyFavorites(false);
                      }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition"
                    >
                      Réinitialiser la recherche
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()
      )}

      {/* Search Mode Prompt Modal */}
      <AnimatePresence>
        {showSearchModePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-accent-500" />
              <div className="w-16 h-16 bg-brand-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-brand-600 dark:text-brand-400">
                <Navigation className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                Trouver des artisans autour de vous ?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Autorisez la géolocalisation pour afficher automatiquement les prestataires les plus proches de votre position actuelle.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowSearchModePrompt(false);
                    sessionStorage.setItem("hasAskedSearchMode", "true");
                    handleAutoSearch();
                  }}
                  className="w-full h-14 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 ring-2 ring-accent-400 ring-offset-2 dark:ring-offset-slate-900"
                >
                  <Navigation className="w-5 h-5" />
                  Oui, autour de moi
                </button>
                <button
                  onClick={() => {
                    setShowSearchModePrompt(false);
                    sessionStorage.setItem("hasAskedSearchMode", "true");
                  }}
                  className="w-full h-14 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors"
                >
                  Non, je ferai une recherche manuelle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
