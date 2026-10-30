import {
  Place,
  Trip,
  ItineraryDay,
  Favorite,
  Expense,
  BudgetSummary,
  User,
  NotificationItem,
} from '../types';

export const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If in production or envUrl points to localhost, always use relative /api/v1 so requests go to the deployed origin
  if (import.meta.env.PROD || !envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
    return '/api/v1';
  }
  return envUrl.replace(/\/$/, '');
})();

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('tripwise_token');
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Generic fetch wrapper
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(options.body !== undefined),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while communicating with the server.');
  }

  return data;
}

export const api = {
  // Places & Maps
  async searchPlaces(query = '', category?: string): Promise<{ data: Place[] }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'all') params.append('category', category);
    return fetchApi(`/places/search?${params.toString()}`);
  },

  async autocomplete(input: string): Promise<{ data: any[] }> {
    return fetchApi(`/places/autocomplete?input=${encodeURIComponent(input)}`);
  },

  async getNearby(lat: number, lng: number, radius = 25000, category?: string): Promise<{ data: Place[] }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });
    if (category && category !== 'all') params.append('category', category);
    return fetchApi(`/places/nearby?${params.toString()}`);
  },

  async getPlaceDetails(placeId: string): Promise<{ data: Place }> {
    return fetchApi(`/places/${placeId}`);
  },

  async getRoutes(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, travelMode = 'DRIVE'): Promise<{ data: any }> {
    return fetchApi('/maps/routes', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, travelMode }),
    });
  },

  // Weather
  async getWeather(lat?: number, lng?: number, destination?: string, date?: string): Promise<{ data: any }> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lng !== undefined) params.append('lng', lng.toString());
    if (destination) params.append('destination', destination);
    if (date) params.append('date', date);
    return fetchApi(`/weather?${params.toString()}`);
  },

  // Flights & Transit
  async searchFlights(origin: string, destination: string, departureDate?: string, passengers = 1, cabinClass = 'ECONOMY', currency = 'INR'): Promise<{ data: any }> {
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      passengers: passengers.toString(),
      cabinClass,
      currency,
    });
    return fetchApi(`/flights/search?${params.toString()}`);
  },

  async searchTransport(origin: string, destination: string, date?: string, type = 'all', currency = 'INR'): Promise<{ data: any }> {
    const params = new URLSearchParams({
      origin,
      destination,
      date: date || new Date().toISOString().split('T')[0],
      type,
      currency,
    });
    return fetchApi(`/transport/search?${params.toString()}`);
  },

  // Accommodations & Dining
  async searchHotels(destination: string, checkIn?: string, checkOut?: string, guests = 2, rooms = 1, currency = 'INR'): Promise<{ data: any }> {
    const params = new URLSearchParams({ destination, currency, guests: guests.toString(), rooms: rooms.toString() });
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    return fetchApi(`/hotels/search?${params.toString()}`);
  },

  async searchRestaurants(destination: string, cuisine?: string, dietary?: string, maxPrice?: number): Promise<{ data: any }> {
    const params = new URLSearchParams({ destination });
    if (cuisine && cuisine !== 'all') params.append('cuisine', cuisine);
    if (dietary && dietary !== 'all') params.append('dietary', dietary);
    if (maxPrice) params.append('maxPrice', maxPrice.toString());
    return fetchApi(`/restaurants/search?${params.toString()}`);
  },

  // Currency
  async getCurrencyRates(base = 'USD'): Promise<{ data: any }> {
    return fetchApi(`/currency/rates?base=${encodeURIComponent(base)}`);
  },

  async convertCurrency(amount: number, from = 'USD', to = 'INR'): Promise<{ data: any }> {
    return fetchApi(`/currency/convert?amount=${amount}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  },

  // AI Assistant & Planner
  async chatAi(prompt: string, history: any[] = [], userPreferences?: any, currentTripContext?: any): Promise<{ data: any }> {
    return fetchApi('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ prompt, history, userPreferences, currentTripContext }),
    });
  },

  async generateItinerary(payload: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
    budget: number;
    currency: string;
    interests: string[];
    pace: string;
    preferredStartTime?: string;
  }): Promise<{ data: any }> {
    return fetchApi('/ai/itinerary', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Trips & Itineraries
  async getTrips(): Promise<{ data: Trip[] }> {
    return fetchApi('/trips');
  },

  async getTrip(tripId: string): Promise<{ data: Trip }> {
    return fetchApi(`/trips/${tripId}`);
  },

  async createTrip(tripData: Partial<Trip> & { initialItinerary?: any }): Promise<{ data: Trip }> {
    return fetchApi('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<{ data: Trip }> {
    return fetchApi(`/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteTrip(tripId: string): Promise<{ message: string }> {
    return fetchApi(`/trips/${tripId}`, { method: 'DELETE' });
  },

  async duplicateTrip(tripId: string): Promise<{ data: Trip }> {
    return fetchApi(`/trips/${tripId}/duplicate`, { method: 'POST' });
  },

  async getTripItinerary(tripId: string): Promise<{ data: ItineraryDay[] }> {
    return fetchApi(`/trips/${tripId}/itinerary`);
  },

  async updateTripItinerary(tripId: string, days: ItineraryDay[]): Promise<{ data: ItineraryDay[] }> {
    return fetchApi(`/trips/${tripId}/itinerary`, {
      method: 'PUT',
      body: JSON.stringify({ days }),
    });
  },

  // Favorites & Collections
  async getFavorites(collection?: string): Promise<{ data: Favorite[] }> {
    const params = collection && collection !== 'All' ? `?collection=${encodeURIComponent(collection)}` : '';
    return fetchApi(`/favorites${params}`);
  },

  async addFavorite(favoriteData: Partial<Favorite>): Promise<{ data: Favorite }> {
    return fetchApi('/favorites', {
      method: 'POST',
      body: JSON.stringify(favoriteData),
    });
  },

  async deleteFavorite(favoriteId: string): Promise<{ message: string }> {
    return fetchApi(`/favorites/${favoriteId}`, { method: 'DELETE' });
  },

  async getCollections(): Promise<{ data: string[] }> {
    return fetchApi('/favorites/collections');
  },

  async renameCollection(oldName: string, newName: string): Promise<{ message: string }> {
    return fetchApi('/favorites/collections/rename', {
      method: 'POST',
      body: JSON.stringify({ oldName, newName }),
    });
  },

  // Budget & Expenses
  async getExpenses(tripId: string): Promise<{ data: Expense[] }> {
    return fetchApi(`/expenses/${tripId}/expenses`);
  },

  async addExpense(tripId: string, expense: Partial<Expense>): Promise<{ data: Expense }> {
    return fetchApi(`/expenses/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },

  async updateExpense(tripId: string, expenseId: string, updates: Partial<Expense>): Promise<{ data: Expense }> {
    return fetchApi(`/expenses/${tripId}/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteExpense(tripId: string, expenseId: string): Promise<{ message: string }> {
    return fetchApi(`/expenses/${tripId}/expenses/${expenseId}`, { method: 'DELETE' });
  },

  async getBudgetSummary(tripId: string): Promise<{ data: BudgetSummary }> {
    return fetchApi(`/expenses/${tripId}/budget-summary`);
  },

  // Profile & User
  async getProfile(): Promise<{ data: User }> {
    return fetchApi('/users/me');
  },

  async updateProfile(updates: Partial<User>): Promise<{ data: User }> {
    return fetchApi('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteAccount(): Promise<{ message: string }> {
    return fetchApi('/users/me', { method: 'DELETE' });
  },

  // Notifications
  async getNotifications(): Promise<{ data: NotificationItem[] }> {
    return fetchApi('/notifications');
  },

  async markNotificationRead(id: string): Promise<{ message: string }> {
    return fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return fetchApi('/notifications/read-all', { method: 'POST' });
  },

  // Health
  async getHealth(): Promise<any> {
    return fetchApi('/health');
  },
};
