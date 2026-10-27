import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CloudSun,
  CloudRain,
  Sun,
  Compass,
  ArrowRight,
  MapPin,
  Calendar,
  Thermometer,
} from 'lucide-react';
import { api } from '../../services/api';

interface HeroBannerProps {
  destination?: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  onPlanClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  destination = 'Kyoto & Arashiyama',
  country = 'Japan',
  description = 'Immerse in ancient bamboo groves, serene zen stone gardens, and historic shrine pavilions nestled in mist-covered valleys.',
  imageUrl = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80',
  lat = 35.0116,
  lng = 135.7681,
  onPlanClick,
}) => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    conditionCode: number;
    rainProb?: number;
  } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);

  // Fetch real Open-Meteo weather for the featured hero destination
  useEffect(() => {
    let isMounted = true;
    const fetchHeroWeather = async () => {
      try {
        setLoadingWeather(true);
        const res = await api.getWeather(lat, lng, destination);
        if (isMounted && res.data?.current) {
          setWeather({
            temp: Math.round(res.data.current.temperature),
            description: res.data.current.weatherDescription || 'Fair Skies',
            conditionCode: res.data.current.weatherCode || 0,
            rainProb: res.data.current.precipitationProbability ?? 12,
          });
        }
      } catch (err) {
        console.warn('Hero live weather fetch skipped:', err);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    };

    fetchHeroWeather();
    return () => {
      isMounted = false;
    };
  }, [lat, lng, destination]);

  const handlePlan = () => {
    if (onPlanClick) {
      onPlanClick();
    } else {
      navigate(`/planner?destination=${encodeURIComponent(destination)}`);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-sky-200" />;
    if (code >= 1 && code <= 3) return <CloudSun className="w-4 h-4 text-amber-200" />;
    return <Sun className="w-4 h-4 text-amber-300" />;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-800 bg-slate-900 text-white min-h-[260px] sm:min-h-[320px] flex flex-col justify-end p-4 sm:p-6 lg:p-8 group">
      {/* High-Resolution Scenic Photography */}
      <img
        src={imageUrl}
        alt={destination}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
        loading="lazy"
        onError={(e) => {
          // Graceful fallback to serene mountain landscape
          (e.currentTarget as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=80';
        }}
      />

      {/* Modern Gradient Overlays for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/20" />
      <div className="absolute inset-0 bg-blue-950/20 mix-blend-overlay" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        {/* Left: Destination Details & Live Weather Tag */}
        <div className="max-w-2xl space-y-2.5 sm:space-y-3">
          {/* Badges Bar: Real Weather & Category */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-white shadow-sm border border-white/20">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              Featured Destination
            </span>

            {/* Real Weather Badge */}
            {weather ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-slate-100 border border-white/10">
                {getWeatherIcon(weather.conditionCode)}
                <span>{weather.temp}°C</span>
                <span className="text-slate-300">• {weather.description}</span>
                {weather.rainProb !== undefined && weather.rainProb > 0 && (
                  <span className="text-sky-300 text-[10px]">({weather.rainProb}% rain)</span>
                )}
              </span>
            ) : loadingWeather ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-[10px] sm:text-[11px] text-slate-300 animate-pulse">
                <Thermometer className="w-3.5 h-3.5" />
                Retrieving live weather...
              </span>
            ) : null}
          </div>

          {/* Destination Title & Region */}
          <div>
            <div className="flex items-center gap-1.5 text-blue-300 text-[11px] sm:text-xs font-bold tracking-wide uppercase">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{country}</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-white mt-0.5 drop-shadow-sm">
              {destination}
            </h1>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Right Action: Plan with AI Button */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={handlePlan}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-target"
            aria-label={`Plan trip to ${destination} with AI`}
          >
            <Sparkles className="w-4 h-4 text-blue-200 animate-spin-slow" />
            <span>Plan with AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
