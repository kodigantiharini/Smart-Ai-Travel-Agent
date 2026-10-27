import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('TripWise AI API Suite', () => {
  it('GET /api/v1/health should return ok status and configuration flags', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('TripWise AI API');
  });

  it('GET /api/v1/places/search should return verified destinations list', async () => {
    const res = await request(app).get('/api/v1/places/search?q=Munnar');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].city).toBe('Munnar');
  });

  it('GET /api/v1/places/autocomplete should return instant suggestions', async () => {
    const res = await request(app).get('/api/v1/places/autocomplete?input=Paris');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/auth/register should validate schema and register a user', async () => {
    const randomEmail = `tester_${Date.now()}@tripwise.test`;
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Traveler',
      email: randomEmail,
      password: 'SecurePassword123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(randomEmail);
  });

  it('POST /api/v1/auth/login with demo user credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'alex@tripwise.ai',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Alex Rivera');
  });

  it('POST /api/v1/ai/assistant should execute tools and return grounded data', async () => {
    const res = await request(app).post('/api/v1/ai/assistant').send({
      prompt: 'Suggest places to visit in Munnar with waterfalls',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toBeDefined();
    expect(Array.isArray(res.body.data.suggestedPlaces)).toBe(true);
    expect(Array.isArray(res.body.data.toolExecutions)).toBe(true);
  });

  it('POST /api/v1/ai/itinerary should generate structured multi-day itinerary with weather and route metrics', async () => {
    const res = await request(app).post('/api/v1/ai/itinerary').send({
      destination: 'Munnar',
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      travelers: 2,
      budget: 800,
      currency: 'USD',
      interests: ['mountain', 'waterfall'],
      pace: 'moderate',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.days.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.days[0].weather).toBeDefined();
    expect(res.body.data.calculatedTotal).toBeGreaterThan(0);
  }, 45000);

  it('GET /api/v1/weather should return live Open-Meteo meteorological report', async () => {
    const res = await request(app).get('/api/v1/weather?destination=Munnar');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.current.temperatureC).toBeDefined();
    expect(res.body.data.daily.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/currency/rates and convert should return live FX rates', async () => {
    const ratesRes = await request(app).get('/api/v1/currency/rates?base=USD');
    expect(ratesRes.status).toBe(200);
    expect(ratesRes.body.success).toBe(true);
    expect(ratesRes.body.data.rates.INR).toBeGreaterThan(50);

    const convRes = await request(app).get('/api/v1/currency/convert?amount=100&from=USD&to=INR');
    expect(convRes.status).toBe(200);
    expect(convRes.body.data.convertedAmount).toBeGreaterThan(5000);
  });

  it('GET /api/v1/flights/search should return airline routes with baggage and fares', async () => {
    const res = await request(app).get('/api/v1/flights/search?origin=DEL&destination=COK');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.offers.length).toBeGreaterThan(0);
    expect(res.body.data.offers[0].bookingUrl).toBeDefined();
  });

  it('GET /api/v1/hotels/search should return accommodations with real amenities', async () => {
    const res = await request(app).get('/api/v1/hotels/search?destination=Munnar');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hotels.length).toBeGreaterThan(0);
    expect(res.body.data.hotels[0].amenities.length).toBeGreaterThan(0);
  }, 30000);

  it('GET /api/v1/restaurants/search should return dining spots with dietary tags', async () => {
    const res = await request(app).get('/api/v1/restaurants/search?destination=Munnar&dietary=vegetarian');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.restaurants.length).toBeGreaterThan(0);
    expect(res.body.data.restaurants[0].dietaryTags).toContain('vegetarian');
  }, 30000);

  it('POST /api/v1/maps/routes should compute real driving distance and duration', async () => {
    const res = await request(app).post('/api/v1/maps/routes').send({
      origin: { lat: 10.0889, lng: 77.0595 },
      destination: { lat: 10.1556, lng: 76.3917 },
      travelMode: 'DRIVE',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.distanceKm).toBeGreaterThan(0);
    expect(res.body.data.coordinates.length).toBeGreaterThanOrEqual(2);
  });
});
