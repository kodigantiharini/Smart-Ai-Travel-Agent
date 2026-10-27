export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  preferences: {
    currency: string;
    units: 'metric' | 'imperial';
    travelStyle: 'budget' | 'comfort' | 'luxury' | 'adventure' | 'cultural';
    interests: string[];
  };
}

export interface Place {
  id: string;
  placeId: string;
  name: string;
  city: string;
  country: string;
  category: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  ratingCount: number;
  photos: string[];
  openingHours?: string[];
  phone?: string;
  website?: string;
  priceLevel?: number;
  popularActivities?: string[];
  tags: string[];
  suggestedDurationMinutes: number;
  bestTimeToVisit?: string;
  distanceKm?: number;
}

export interface Trip {
  _id?: string;
  id?: string;
  owner?: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  currency: string;
  status: 'planning' | 'upcoming' | 'ongoing' | 'completed' | 'archived';
  coverImage?: string;
  notes?: string;
  createdAt?: string;
}

export interface ItineraryStop {
  id?: string;
  placeId: string;
  name: string;
  category: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photo?: string;
  visitDurationMinutes: number;
  arrivalTime?: string;
  departureTime?: string;
  estimatedCost?: number;
  notes?: string;
  order: number;
  travelTimeMinutes?: number;
  distanceFromPrevKm?: number;
  source?: string;
  lastChecked?: string;
}

export interface ItineraryDay {
  _id?: string;
  id?: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  stops: ItineraryStop[];
  weather?: {
    tempMax: number;
    tempMin: number;
    condition: string;
    icon: string;
    rainProbability: number;
    advisory?: string;
  };
}

export interface Favorite {
  _id?: string;
  id?: string;
  userId?: string;
  placeId: string;
  name: string;
  category: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  ratingCount?: number;
  photo?: string;
  collectionName: string;
  notes?: string;
  createdAt?: string;
}

export interface Expense {
  _id?: string;
  id?: string;
  userId?: string;
  tripId: string;
  category: 
    | 'transportation'
    | 'accommodation'
    | 'food'
    | 'tickets'
    | 'activities'
    | 'shopping'
    | 'miscellaneous';
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
  status: 'planned' | 'actual';
  createdAt?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  currency: string;
  travelers: number;
  plannedTotal: number;
  actualTotal: number;
  remainingBalance: number;
  perPersonBudget: number;
  perPersonActual: number;
  categoryBreakdown: Record<string, { planned: number; actual: number }>;
}

export interface NotificationItem {
  _id?: string;
  id?: string;
  recipient?: string;
  type: 'trip' | 'recommendation' | 'budget' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  payload?: any;
}

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
  source: string;
  lastChecked: string;
}

export interface FlightSegment {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  durationMinutes: number;
  cabinClass: string;
}

export interface FlightOffer {
  id: string;
  airline?: string;
  airlineName: string;
  airlineLogo?: string;
  flightNumber?: string;
  origin?: string;
  originIata: string;
  destination?: string;
  destinationIata: string;
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  durationFormatted?: string;
  stops: number;
  segments?: FlightSegment[];
  price: number;
  currency: string;
  cabinClass: string;
  baggage?: string;
  baggageAllowance?: string;
  helpline?: string;
  terminalInfo?: string;
  bookingUrl: string;
  isIndicativeFare: boolean;
  lastChecked: string;
}

export interface DistrictStationInfo {
  district: string;
  state: string;
  primaryStation: string;
  stationCode: string;
  secondaryStations?: string[];
  isHillOrRemote?: boolean;
  nearestRailhead?: string;
  distanceToRailheadKm?: number;
  primaryBusStand: string;
  stateRTC: string;
  majorBusOperators: string[];
}

export interface TransportOption {
  id: string;
  type: 'train' | 'bus' | 'ferry';
  title?: string;
  operator: string;
  serviceNumber: string;
  originStation?: string;
  destinationStation?: string;
  departureTime: string;
  arrivalTime?: string;
  duration?: string;
  durationFormatted?: string;
  distanceKm?: number;
  classes?: any;
  price?: number;
  currency?: string;
  helpline?: string;
  frequency?: string;
  bookingUrl: string;
  bookingPortalName?: string;
  status?: string;
  notes?: string;
  tip?: string;
  boardingPoint?: string;
  droppingPoint?: string;
  nearestRailhead?: string;
  lastChecked?: string;
}

export interface HotelOffer {
  id: string;
  name: string;
  category: string;
  destination: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  phone?: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  rating: number;
  ratingCount: number;
  starRating: number;
  pricePerNight: number;
  currency: string;
  photos: string[];
  amenities: string[];
  cancellationPolicy: string;
  bookingUrl: string;
  bookingProvider: string;
  isAvailable: boolean;
  distanceFromCenterKm?: number;
  lastChecked: string;
}

export interface RestaurantItem {
  id: string;
  name: string;
  city: string;
  cuisineTypes: string[];
  dietaryTags: string[];
  priceLevel: number;
  priceIndicator: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  ratingCount: number;
  openingHoursStatus: string;
  mustTryDishes: string[];
  photos: string[];
  distanceKm?: number;
  source: string;
  lastChecked: string;
}

export interface ToolExecutionRecord {
  toolName: string;
  queryParam: string;
  status: 'executed' | 'fallback' | 'failed';
  summary: string;
  dataSnippet?: any;
}

export interface AgentChatResponse {
  reply: string;
  toolExecutions: ToolExecutionRecord[];
  suggestedPlaces: Place[];
  weatherSnapshot?: WeatherReport;
  hotelOffers?: HotelOffer[];
  flightOffers?: FlightOffer[];
  actionPayload?: {
    type: 'itinerary_preview' | 'itinerary_modified' | 'budget_adjusted' | 'weather_warning';
    data: any;
  };
  tips: string[];
  isLiveAi: boolean;
}
