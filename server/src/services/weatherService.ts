import axios from 'axios';
import { ENV } from '../config/env.js';

export interface CurrentWeather {
  temperatureC: number;
  feelsLikeC: number;
  humidityPercent: number;
  precipitationMm: number;
  weatherCode: number;
  weatherCondition: string;
  weatherIcon: string;
  windSpeedKmh: number;
  uvIndex?: number;
}

export interface DailyForecast {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  weatherCode: number;
  weatherCondition: string;
  weatherIcon: string;
  precipitationProbabilityMax: number;
  precipitationSumMm: number;
  uvIndexMax: number;
  windSpeedMaxKmh: number;
  advisory?: string;
  suitability: 'optimal' | 'moderate' | 'indoor_recommended' | 'severe_weather_alert';
}

export interface WeatherReport {
  destination: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly?: {
    time: string[];
    temperature_2m: number[];
  };
  alerts: string[];
  isForecast: boolean;
  source: 'open-meteo' | 'openweather' | 'climatological_estimate';
  lastChecked: string;
}

export class WeatherService {
  private static cache = new Map<string, { report: WeatherReport; expires: number }>();
  private static CACHE_TTL_MS = 25 * 60 * 1000; // 25 minutes cache

  /**
   * Translate WMO Weather Code to human text and Lucide-friendly icons
   */
  public static interpretWeatherCode(code: number): { condition: string; icon: string; advisory?: string } {
    if (code === 0) {
      return { condition: 'Clear Sky', icon: 'sun', advisory: 'Great weather for outdoor exploration and photography.' };
    }
    if (code === 1 || code === 2) {
      return { condition: 'Mainly Clear & Partly Cloudy', icon: 'cloud-sun', advisory: 'Pleasant conditions for walking and sightseeing.' };
    }
    if (code === 3) {
      return { condition: 'Overcast', icon: 'cloud', advisory: 'Comfortable diffused daylight, minimal sun glare.' };
    }
    if (code === 45 || code === 48) {
      return { condition: 'Misty & Foggy', icon: 'cloud-fog', advisory: 'Drive cautiously along mountain hill roads. Reduced scenic vista visibility.' };
    }
    if (code >= 51 && code <= 57) {
      return { condition: 'Light Drizzle', icon: 'cloud-drizzle', advisory: 'Carry a light raincoat or umbrella. Light walking is still pleasant.' };
    }
    if (code >= 61 && code <= 67) {
      return { condition: 'Rainy', icon: 'cloud-rain', advisory: 'Rain showers expected. Schedule indoor museums, galleries, or covered viewpoints.' };
    }
    if (code >= 71 && code <= 77) {
      return { condition: 'Snowfall', icon: 'snowflake', advisory: 'Chilly snow conditions. Wear insulated thermal gear and waterproof boots.' };
    }
    if (code >= 80 && code <= 82) {
      return { condition: 'Heavy Showers', icon: 'cloud-rain', advisory: 'Sudden rain bursts. Avoid open waterfalls and steep rocky trails.' };
    }
    if (code >= 95 && code <= 99) {
      return { condition: 'Thunderstorm', icon: 'cloud-lightning', advisory: 'Active thunderstorm alert! Postpone open-air treks and water sports.' };
    }
    return { condition: 'Fair Weather', icon: 'sun', advisory: 'Normal travel conditions.' };
  }

  /**
   * Get live weather and 7-day forecast for coordinates
   */
  public static async getWeather(
    lat: number,
    lng: number,
    destinationName = 'Destination',
    targetDate?: string
  ): Promise<WeatherReport> {
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.report;
    }

    // 1. Live Open-Meteo Forecast (Free, global, highly accurate with hourly & daily data)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max&timezone=auto`;
      const res = await axios.get(url, { timeout: 6000 });

      if (res.data?.current && res.data?.daily) {
        const cur = res.data.current;
        const dailyData = res.data.daily;
        const curMeta = this.interpretWeatherCode(cur.weather_code);

        const daily: DailyForecast[] = (dailyData.time || []).map((dateStr: string, idx: number) => {
          const wCode = dailyData.weather_code?.[idx] || 0;
          const meta = this.interpretWeatherCode(wCode);
          const precipProb = dailyData.precipitation_probability_max?.[idx] || 0;
          const tMax = dailyData.temperature_2m_max?.[idx] || 25;
          const uv = dailyData.uv_index_max?.[idx] || 5;

          let suitability: DailyForecast['suitability'] = 'optimal';
          let customAdvisory = meta.advisory;

          if (wCode >= 95) {
            suitability = 'severe_weather_alert';
            customAdvisory = 'Severe thunderstorm alert. Outdoor activities should be rescheduled indoors.';
          } else if (precipProb > 50 || (wCode >= 61 && wCode <= 82)) {
            suitability = 'indoor_recommended';
            customAdvisory = `High rain probability (${precipProb}%). Ideal for cozy cafes, indoor cultural centers, or scenic train rides.`;
          } else if (tMax > 38) {
            suitability = 'moderate';
            customAdvisory = `Intense heat (${tMax}°C). Schedule sightseeing early in the morning and hydrate frequently.`;
          }

          return {
            date: dateStr,
            tempMaxC: Math.round(tMax),
            tempMinC: Math.round(dailyData.temperature_2m_min?.[idx] || 15),
            weatherCode: wCode,
            weatherCondition: meta.condition,
            weatherIcon: meta.icon,
            precipitationProbabilityMax: precipProb,
            precipitationSumMm: dailyData.precipitation_sum?.[idx] || 0,
            uvIndexMax: uv,
            windSpeedMaxKmh: Math.round(dailyData.wind_speed_10m_max?.[idx] || 10),
            advisory: customAdvisory,
            suitability,
          };
        });

        const alerts: string[] = [];
        if (cur.weather_code >= 95) {
          alerts.push('Thunderstorm alert active in the area. Seek sturdy shelter.');
        } else if (daily.some((d) => d.precipitationProbabilityMax > 60)) {
          alerts.push('High rain probability during the forecast window. Prepare rain gear.');
        }
        if (daily.some((d) => d.tempMaxC > 38)) {
          alerts.push('Extreme heat forecast on peak days. Limit strenuous midday sun exposure.');
        }

        const report: WeatherReport = {
          destination: destinationName,
          coordinates: { lat, lng },
          current: {
            temperatureC: Math.round(cur.temperature_2m),
            feelsLikeC: Math.round(cur.apparent_temperature),
            humidityPercent: Math.round(cur.relative_humidity_2m),
            precipitationMm: cur.precipitation,
            weatherCode: cur.weather_code,
            weatherCondition: curMeta.condition,
            weatherIcon: curMeta.icon,
            windSpeedKmh: Math.round(cur.wind_speed_10m),
            uvIndex: daily[0]?.uvIndexMax || 5,
          },
          daily,
          hourly: res.data?.hourly ? {
            time: (res.data.hourly.time || []).slice(0, 24),
            temperature_2m: (res.data.hourly.temperature_2m || []).slice(0, 24).map((t: number) => Math.round(t)),
          } : undefined,
          alerts,
          isForecast: true,
          source: 'open-meteo',
          lastChecked: new Date().toISOString(),
        };

        this.cache.set(cacheKey, { report, expires: Date.now() + this.CACHE_TTL_MS });
        return report;
      }
    } catch (err: any) {
      console.warn('Open-Meteo live weather error, falling back to climate estimates:', err.message);
    }

    // 2. Realistic Climatological Estimate for distant dates or offline
    const isTropical = lat > 8 && lat < 25;
    const estTemp = isTropical ? 26 : 18;

    const fallbackReport: WeatherReport = {
      destination: destinationName,
      coordinates: { lat, lng },
      current: {
        temperatureC: estTemp,
        feelsLikeC: estTemp + 1,
        humidityPercent: 65,
        precipitationMm: 0,
        weatherCode: 1,
        weatherCondition: 'Pleasant & Mild (Seasonal Average)',
        weatherIcon: 'cloud-sun',
        windSpeedKmh: 12,
        uvIndex: 5,
      },
      daily: Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          date: d.toISOString().split('T')[0],
          tempMaxC: estTemp + 3,
          tempMinC: estTemp - 4,
          weatherCode: 1,
          weatherCondition: 'Seasonal Typical Weather',
          weatherIcon: 'sun',
          precipitationProbabilityMax: 15,
          precipitationSumMm: 0,
          uvIndexMax: 6,
          windSpeedMaxKmh: 14,
          advisory: 'Historical average conditions. Check back 3 days prior to your trip for live satellite forecasts.',
          suitability: 'optimal',
        };
      }),
      alerts: ['Showing historical climatological estimates (live forecast unavailable or outside 16-day window).'],
      isForecast: false,
      source: 'climatological_estimate',
      lastChecked: new Date().toISOString(),
    };

    return fallbackReport;
  }
}
