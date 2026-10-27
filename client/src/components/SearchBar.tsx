import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, X, Navigation, Filter } from 'lucide-react';
import { api } from '../services/api';

interface SearchBarProps {
  initialQuery?: string;
  initialCategory?: string;
  onSearch?: (query: string, category?: string) => void;
  onLocationFound?: (lat: number, lng: number) => void;
  showCategories?: boolean;
}

export const CATEGORIES = [
  { id: 'all', label: 'All Worldwide Destinations' },
  { id: 'historical_monument', label: 'World Wonders & Monuments' },
  { id: 'mountain', label: 'Mountains & Alpine Peaks' },
  { id: 'beach', label: 'Tropical Beaches & Islands' },
  { id: 'waterfall', label: 'Waterfalls & Nature' },
  { id: 'park', label: 'National Parks & Canyons' },
  { id: 'museum', label: 'Art & World Museums' },
  { id: 'religious_site', label: 'Sacred Temples & Shrines' },
  { id: 'viewpoint', label: 'Panoramic Viewpoints' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  initialCategory = 'all',
  onSearch,
  onLocationFound,
  showCategories = true,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced Autocomplete
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.autocomplete(query);
        if (res.data && res.data.length > 0) {
          setSuggestions(res.data);
          setIsSuggesting(true);
        } else {
          setSuggestions([]);
          setIsSuggesting(false);
        }
      } catch (err) {
        console.warn('Autocomplete fetch failed:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener for autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSuggesting(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSuggesting(false);
    if (onSearch) {
      onSearch(query, category);
    } else {
      navigate(`/explore?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const text = suggestion.text || suggestion.mainText;
    setQuery(text);
    setIsSuggesting(false);
    if (onSearch) {
      onSearch(text, category);
    } else {
      navigate(`/explore?q=${encodeURIComponent(text)}&category=${encodeURIComponent(category)}`);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        if (onLocationFound) {
          onLocationFound(latitude, longitude);
        } else {
          navigate(`/nearby?lat=${latitude}&lng=${longitude}`);
        }
      },
      (err) => {
        setLocating(false);
        alert(`Location access denied or unavailable: ${err.message}. You can still search destinations manually.`);
      },
      { timeout: 8000 }
    );
  };

  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    if (onSearch) {
      onSearch(query, catId);
    }
  };

  return (
    <div className="w-full space-y-4" ref={dropdownRef}>
      {/* Main Search Bar Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center bg-white dark:bg-slate-900 rounded-3xl p-2 sm:p-2.5 shadow-xl border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all duration-300"
      >
        <div className="pl-3 sm:pl-4 text-teal-600 dark:text-teal-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any destination worldwide (e.g. Paris, Tokyo, Swiss Alps, Rome, Grand Canyon, Taj Mahal...)"
          className="w-full bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Clear input button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Current Location GPS Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          title="Discover near current location"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors border-l border-slate-200 dark:border-slate-800 ml-1"
        >
          <Navigation className={`w-3.5 h-3.5 text-teal-500 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Locating...' : 'Near Me'}</span>
        </button>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="ml-1 sm:ml-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold text-white bg-gradient-brand hover:opacity-95 rounded-2xl shadow-md transition-all shadow-glow-teal hover:scale-[1.02] active:scale-95"
        >
          Search
        </button>

        {/* Autocomplete Dropdown */}
        {isSuggesting && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              Verified Destinations
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionSelect(item)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-600 group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.mainText || item.text}</p>
                  {item.secondaryText && (
                    <p className="text-xs text-slate-400">{item.secondaryText}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Categories Spacious Wrapped Arrangement */}
      {showCategories && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-navy-950 shadow-md shadow-glow-teal'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:text-teal-600'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
