# TripWise AI 🌍✈️
> **Intelligent Luxury Travel Guide & Grounded AI Trip Planning Platform**

TripWise AI is a complete, modern, responsive, full-stack travel guide and AI trip planner built from scratch. It connects travelers with real-world verified destinations, interactive geographic maps, proximity-based nearby attractions discovery, grounded Gemini AI travel recommendations, multi-day itinerary scheduling, and precision travel budget calculations.

---

## 🌟 Key Highlights & Features

### 1. 🎬 Cinematic Animated Splash Screen & First-Time Onboarding
- **Scenic Travel Background:** Full-screen mountain landscape with subtle GPU-accelerated Ken Burns zoom.
- **Atmospheric Palette:** Deep navy (`#0A1128`), teal (`#0D9488`), and warm sunrise amber (`#F59E0B`).
- **Animated SVG Route:** Curved travel flight trajectory with drawing dash-array and moving pointer.
- **Pulsing Compass Badge:** Elegant scaling and rotational micro-animation with ambient aura.
- **3-Screen First-Time Onboarding:** *Discover*, *Plan*, and *Explore* modal with persistence in `localStorage`.
- **Accessibility:** Full `prefers-reduced-motion` compliance using Framer Motion's `useReducedMotion()`.

### 2. 🗺️ Real Location & Places Architecture
- **Grounded Verification:** Over 15+ rich verified real-world places (Kolukkumalai Tea Estate, Attukad Waterfalls, Eravikulam National Park, Mattupetty Dam, Eiffel Tower, Louvre Museum, Senso-ji, Shibuya Crossing, Uluwatu Temple, Central Park, Marina Beach, Colosseum, Burj Khalifa) with exact GPS coordinates, reviews, photos, and operating hours.
- **Google Maps Platform Integration:**
  - Google Places API (New) for real-time text query and nearby attraction discovery.
  - Google Geocoding & Reverse Geocoding API.
  - Google Routes API for traffic-aware travel duration and distance computation.
  - High-fidelity verified fallback engine so the application functions seamlessly out of the box even before external billing keys are configured.
- **Interactive Leaflet / Google Maps Engine:** Real map tiles, custom SVG marker pins, synchronized selection popups, and route path visualization.

### 3. 🤖 Grounded Gemini Travel Concierge & Trip Planner
- **AI Travel Assistant (`/assistant`):** Real-time conversational concierge with sample prompts ("Plan 3 days in Munnar", "Waterfalls near me", "Family-friendly spots under $500").
- **No Hallucinations:** AI outputs are validated against real registered places and include uncertainty disclaimers for estimated costs.
- **Interactive Multi-Step Planner (`/planner`):** Destination, dates, budget, currency, travelers, travel pace (relaxed/moderate/packed), and interests synthesize into day-by-day itineraries with arrival/departure schedules.

### 4. 💼 Complete Trip & Itinerary Management (`/trips`)
- Create, view, edit, duplicate, archive, and delete trips.
- Day-wise stop management: reorder stops (move up/down), edit durations, delete stops, or append new places.
- Route distance and estimated travel times between consecutive stops.
- Itinerary export to structured text and JSON.

### 5. 💰 Precision Budget Planner & Expense Tracker (`/budget`, `/expenses`)
- Category breakdown: Transportation, Accommodation, Food, Tickets, Activities, Shopping, Miscellaneous.
- Visual progress bar comparing Total Budget, Planned Expenses, and Actual Spend.
- Remaining balance calculation with deficit/surplus alerts.
- Per-person and per-day cost auditing.
- One-click CSV export (`Trip_Expenses.csv`).

### 6. ❤️ Saved Destinations & Custom Collections (`/saved`, `/collections`)
- Bookmark favorite places with confetti micro-animations.
- Organize favorites into custom themed collections (*Dream Viewpoints*, *European Summer*, etc.).
- Interactive Map View of all saved favorites.

### 7. 📱 20 Fully Functional Application Pages
1. **Home** (`/`) - Hero, destination search bar, autocomplete, categories, featured spots, and inspiration.
2. **Explore Destinations** (`/explore`) - Filters, sorting, search, category pills, and split map/list view.
3. **Interactive Map** (`/map`) - Fullscreen map with live pins and synchronized preview sidebar.
4. **Place Details** (`/places/:placeId`) - Photo showcase, operating hours, directions, reviews, and nearby sights.
5. **Nearby Attractions** (`/nearby`) - Geolocation detection, radius slider (5–50 km), and proximity badges.
6. **AI Travel Assistant** (`/assistant`) - Gemini conversation with grounded place cards.
7. **AI Trip Planner** (`/planner`) - Multi-step generator converting inputs into day-by-day plans.
8. **Itinerary Details** (`/trips/:tripId/itinerary`) - Day schedule, drag/move controls, and export.
9. **My Trips** (`/trips`) - Filter by upcoming/planning/completed/archived with duplication controls.
10. **Saved Places** (`/saved`) - Bookmarked favorites with map/grid toggle.
11. **Collections** (`/collections`) - Group and rename custom travel folders.
12. **Budget Planner** (`/budget`) - Visual spending velocity charts and per-person metrics.
13. **Expense Tracker** (`/expenses`) - Log receipts, filter planned vs actual, and export CSV.
14. **User Profile** (`/profile`) - Traveler passport, lifetime stats, and style preferences.
15. **Settings** (`/settings`) - Currencies (USD, INR, EUR, GBP, JPY, AUD), metric/imperial units, dark/light theme, and account deletion.
16. **Login** (`/login`) - Secure sign-in with **One-Click Demo Login (Alex Rivera)** shortcut.
17. **Registration** (`/register`) - User registration with schema validation.
18. **Forgot Password** (`/forgot-password`) - Password reset simulation.
19. **Notifications** (`/notifications`) - Trip updates, recommendations, and status toggles.
20. **Legal & About** (`/legal`) - Tabbed About, Contact Form, Privacy Policy, and Terms of Service.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, React Router v7, Leaflet, Canvas Confetti |
| **Backend** | Node.js, Express.js (ESM), TypeScript, Mongoose / MongoDB, JWT, bcryptjs, Helmet, Morgan, Express Rate Limit, Zod, Axios |
| **External APIs** | Google Maps Platform (Places New, Routes, Geocoding), Google Gemini API, Cloudinary adapter |
| **Testing** | Vitest, Supertest |
| **Styling** | Custom Glassmorphism design system, Navy/Teal/Emerald/Amber palette, Dark/Light modes |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v24.14.1)
- **npm**: v9+ (tested on v11.11.0)
- **MongoDB**: Local MongoDB daemon or MongoDB Atlas URI (application includes an automatic in-memory hybrid store if MongoDB is not running locally).

### 1. Installation
Clone or open the project directory and install dependencies:
```bash
# In the project root
npm run install:all
```
Or individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Environment Variables Configuration

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5175
MONGODB_URI=mongodb://localhost:27017/tripwise
JWT_SECRET=tripwise_super_secure_jwt_token_secret_key_2026_dev
JWT_EXPIRES_IN=7d

# Optional Live API Keys (Leave blank to use verified real-world dataset)
GOOGLE_MAPS_API_KEY=
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_MAPS_API_KEY=
```

### 3. Running the Application Locally
To run both backend server and frontend client concurrently:
```bash
# Start backend server (port 5000)
cd server
npm run dev

# In a second terminal, start frontend client (port 5175)
cd client
npm run dev
```

Visit **`http://localhost:5175/`** in your browser.

---

## 🧪 Testing

Run backend REST API integration tests (verifies health check, search, autocomplete, user registration, authentication, AI assistant reasoning, and itinerary generation):
```bash
cd server
npm test
```
*Result: 7/7 automated tests passing (100% pass rate).*

---

## 🔒 Security Best Practices Implemented
- **Helmet Security Headers:** Content security headers configured.
- **CORS Restriction:** Explicit allowlist for `localhost:5175`, `localhost:5173`, and production domains.
- **Rate Limiting:** IP rate limiter (300 requests / 15 mins for API, 30 requests / 15 mins for Auth).
- **Password Hashing:** Passwords hashed using `bcrypt` with salt rounds.
- **JWT Authorization:** Standardized `Bearer <token>` verification on all protected endpoints.
- **Input Validation:** Zod schema parsing prevents NoSQL injections and malformed payloads.
- **Credential Protection:** Private keys (`GEMINI_API_KEY`, `JWT_SECRET`) strictly remain on the backend server.

---

## 🚢 Deployment Architecture
- **Render (Full-Stack / Blueprint):** See the complete [Render Deployment Guide](./RENDER_DEPLOYMENT.md) for 1-click `render.yaml` blueprint deployment or manual setup.
- **Frontend:** Configured for **Render Static Sites** or **Vercel** (`client/dist` static build with SPA rewrites).
- **Backend:** Configured for **Render** / **Railway** with `npm run build && npm start`.
- **Database:** Connects cleanly to **MongoDB Atlas** by setting `MONGODB_URI=mongodb+srv://...` in production environment variables (includes automatic resilient in-memory fallback).

---

## 👤 Demo User Credentials
For instant exploration and review testing, click **"One-Click Demo Login (Alex Rivera)"** on the `/login` screen, or use:
- **Email:** `alex@tripwise.ai`
- **Password:** `Password123!`
