import { describe, it, expect } from 'vitest';
import { api } from './services/api';

describe('TripWise Client Service Suite', () => {
  it('api object should expose all core endpoints', () => {
    expect(typeof api.searchPlaces).toBe('function');
    expect(typeof api.getWeather).toBe('function');
    expect(typeof api.searchFlights).toBe('function');
    expect(typeof api.searchTransport).toBe('function');
    expect(typeof api.searchHotels).toBe('function');
    expect(typeof api.searchRestaurants).toBe('function');
    expect(typeof api.getCurrencyRates).toBe('function');
    expect(typeof api.convertCurrency).toBe('function');
    expect(typeof api.chatAi).toBe('function');
    expect(typeof api.generateItinerary).toBe('function');
    expect(typeof api.getTrips).toBe('function');
    expect(typeof api.createTrip).toBe('function');
  });
});
