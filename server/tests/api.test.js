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
    it('POST /api/v1/ai/assistant should return helpful recommendations with real places', async () => {
        const res = await request(app).post('/api/v1/ai/assistant').send({
            prompt: 'Suggest places to visit in Munnar with waterfalls',
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.reply).toBeDefined();
        expect(Array.isArray(res.body.data.suggestedPlaces)).toBe(true);
    });
    it('POST /api/v1/ai/itinerary should generate structured multi-day itinerary', async () => {
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
    }, 45000);
});
