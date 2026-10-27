import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  AlertTriangle,
  Compass,
  Calendar,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { WeatherReport, DailyForecast } from '../types';

interface WeatherWidgetProps {
  weather: WeatherReport;
  className?: string;
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  className = '',
  compact = false,
}) => {
  if (!weather || !weather.current) return null;

  const renderWeatherIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case 'sun':
        return <Sun size={size} className="text-amber-500 animate-spin-slow" />;
      case 'cloud-sun':
        return <CloudSun size={size} className="text-amber-400" />;
      case 'cloud-rain':
      case 'cloud-drizzle':
        return <CloudRain size={size} className="text-blue-500" />;
      case 'cloud-lightning':
        return <CloudLightning size={size} className="text-amber-600 animate-pulse" />;
      case 'snowflake':
        return <Snowflake size={size} className="text-cyan-400" />;
      case 'cloud':
      default:
        return <Cloud size={size} className="text-slate-400" />;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs ${className}`}>
        {renderWeatherIcon(weather.current.weatherIcon, 16)}
        <span className="font-bold text-slate-800 dark:text-slate-200">{weather.current.temperatureC}°C</span>
        <span className="text-slate-500 dark:text-slate-400">• {weather.current.weatherCondition}</span>
        {weather.daily?.[0]?.precipitationProbabilityMax > 40 && (
          <span className="text-blue-600 dark:text-blue-400 font-medium">💧 {weather.daily[0].precipitationProbabilityMax}% rain</span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xl border border-slate-700/60 overflow-hidden relative ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-teal-400 shrink-0" />
          <span className="text-xs uppercase tracking-wider font-semibold text-teal-300">
            Real-Time Meteorological Intelligence
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700 self-start sm:self-auto">
          <ShieldCheck size={12} className="text-teal-400" />
          <span>{weather.source} • Verified</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-inner">
            {renderWeatherIcon(weather.current.weatherIcon, 42)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">{weather.current.temperatureC}°C</span>
              <span className="text-sm text-slate-400">Feels like {weather.current.feelsLikeC}°C</span>
            </div>
            <p className="text-base font-semibold text-teal-300">{weather.current.weatherCondition}</p>
            <p className="text-xs text-slate-400">{weather.destination}</p>
          </div>
        </div>

        {/* Vital Indicators */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Droplets size={12} className="text-blue-400" /> Rain Prob
            </span>
            <span className="text-sm font-bold text-blue-300 mt-1">
              {weather.daily?.[0]?.precipitationProbabilityMax || 0}%
            </span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-slate-700/60">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Wind size={12} className="text-teal-400" /> Wind
            </span>
            <span className="text-sm font-bold text-slate-200 mt-1">
              {weather.current.windSpeedKmh} km/h
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sun size={12} className="text-amber-400" /> UV Index
            </span>
            <span className="text-sm font-bold text-amber-300 mt-1">
              {weather.current.uvIndex || 5}/10
            </span>
          </div>
        </div>
      </div>

      {/* Advisory Banner */}
      {weather.daily?.[0]?.advisory && (
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-teal-950/50 border border-teal-800/40 text-teal-200 text-xs">
          <AlertTriangle size={16} className="text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{weather.daily[0].advisory}</p>
        </div>
      )}

      {/* Hourly Temperature Trend (Open-Meteo live hourly=temperature_2m) */}
      {weather.hourly && weather.hourly.time && weather.hourly.temperature_2m && weather.hourly.time.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-teal-400" /> Hourly Temperature Trend
            </span>
            <span className="text-[11px] text-teal-300/90 font-mono">Open-Meteo Live</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
            {weather.hourly.time.slice(0, 18).map((timeStr: string, idx: number) => {
              const hourNum = new Date(timeStr).getHours();
              const hourLabel = isNaN(hourNum)
                ? timeStr.split('T')[1]?.slice(0, 5) || timeStr
                : `${hourNum % 12 === 0 ? 12 : hourNum % 12}${hourNum >= 12 ? 'pm' : 'am'}`;
              const temp = Math.round(weather.hourly?.temperature_2m?.[idx] ?? 0);
              return (
                <div
                  key={`${timeStr}-${idx}`}
                  className="flex flex-col items-center flex-shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 min-w-[50px] text-center"
                >
                  <span className="text-[10px] text-slate-400 font-medium">{hourLabel}</span>
                  <span className="text-xs font-bold text-amber-300 mt-0.5">{temp}°C</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7-Day Forecast Row */}
      {weather.daily && weather.daily.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-teal-400" /> 7-Day Precision Forecast
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Next 7 Days</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-7">
            {weather.daily.slice(0, 7).map((d: DailyForecast, i: number) => {
              const dayName = i === 0 ? 'Today' : new Date(d.date).toLocaleDateString([], { weekday: 'short' });
              return (
                <div
                  key={d.date}
                  className="flex flex-col items-center p-2 rounded-xl bg-slate-800/70 border border-slate-700/50 hover:border-teal-500/40 transition-colors text-center shrink-0 min-w-[62px] sm:min-w-0"
                >
                  <span className="text-[11px] font-semibold text-slate-300">{dayName}</span>
                  <div className="my-1.5">{renderWeatherIcon(d.weatherIcon, 18)}</div>
                  <span className="text-xs font-bold text-slate-100">{d.tempMaxC}°</span>
                  <span className="text-[10px] text-slate-400">{d.tempMinC}°</span>
                  {d.precipitationProbabilityMax > 20 && (
                    <span className="text-[9px] text-blue-400 font-medium mt-1">
                      {d.precipitationProbabilityMax}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
