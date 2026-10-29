# 🚀 Render Deployment Guide for TripWise AI

This guide walks you through deploying **TripWise AI** to [Render](https://render.com) using **free-tier friendly** configurations.

---

## 🏗️ Architecture Options on Render

| Deployment Mode | Description | Render Free Tier Usage | Recommendation |
|---|---|---|---|
| **Option 1: Unified Full-Stack (Recommended)** | The Node Express server serves both the **React frontend** (`client/dist`) and the **REST API** (`/api/v1`) from a single service. | **1 Web Service** (750 free hours/month) | ⭐ **Best & Easiest** (Zero CORS issues, single URL) |
| **Option 2: Decoupled Services** | **Web Service** for Node.js Backend + **Static Site** for React Vite Frontend. | **1 Web Service** + **1 Static Site** (Static sites have unlimited free bandwidth) | Great if you want CDN edge caching for the frontend |

---

## 📋 Prerequisites

1. **GitHub Account**: Your TripWise AI repository pushed to GitHub.
2. **Render Account**: Sign up for free at [render.com](https://render.com).
3. **MongoDB Atlas Database (Free)**:
   - Create a free M0 cluster on [mongodb.com/atlas](https://www.mongodb.com/atlas).
   - In **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere so Render can connect).
   - In **Database Access**, create a database user and password.
   - Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/tripwise?retryWrites=true&w=majority`.
   *(Note: If you don't configure MongoDB, TripWise AI includes an automatic resilient in-memory fallback store so the application remains 100% operational).*

---

## ⚡ Method 1: Deploy with Render Blueprint (1-Click Automated)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint file.

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub repository (`Smart-Ai-Travel-Agent` or your fork).
4. Render will automatically detect `render.yaml` and configure:
   - **Service Type:** Web Service (`tripwise-ai`)
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/v1/health`
5. Under Environment Variables:
   - `JWT_SECRET`: Render will auto-generate a secure random secret.
   - `MONGODB_URI`: Paste your MongoDB Atlas URI.
   - Any optional API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `GEOAPIFY_API_KEY`).
6. Click **Apply**.
7. Wait 2–3 minutes for the build and deployment to complete. Your application will be live at `https://<service-name>.onrender.com`!

---

## 🛠️ Method 2: Manual Dashboard Setup (Unified Full-Stack)

If you prefer to configure the service manually through the Render UI:

### Step 1: Create a New Web Service
1. In the Render Dashboard, click **New +** > **Web Service**.
2. Select **Build and deploy from a Git repository** and connect your repository.

### Step 2: Configure Service Details
- **Name:** `tripwise-ai`
- **Region:** Choose closest to your users (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
- **Branch:** `main`
- **Root Directory:** *(leave blank — defaults to repository root)*
- **Runtime:** `Node`
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```
- **Instance Type:** `Free`

### Step 3: Configure Environment Variables
Under the **Environment Variables** section, click **Add Environment Variable**:

| Key | Recommended Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations and static frontend serving |
| `PORT` | `10000` | Render assigns this automatically |
| `JWT_SECRET` | *(Random 32+ char string)* | Used for JWT signing (e.g. `generate-your-own-random-secret-key-32ch`) |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `CLIENT_URL` | `https://<your-service-name>.onrender.com` | Optional (used for CORS; self-domain is permitted by default) |
| `GROQ_API_KEY` | *(Optional)* | High-speed AI itinerary & chat engine |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini AI assistant |
| `GEOAPIFY_API_KEY` | *(Optional)* | Real-world places, geocoding & routing |
| `OPENWEATHER_API_KEY`| *(Optional)* | Meteorological forecasts (Open-Meteo fallback is built-in free) |

### Step 4: Health Check (Advanced Settings)
- Expand **Advanced** at the bottom.
- Set **Health Check Path** to:
  ```
  /api/v1/health
  ```
- Click **Create Web Service**.

---

## 🌐 Method 3: Decoupled Setup (Static Site + Web Service)

If you prefer serving the frontend via Render's global CDN:

### Part A: Deploy Backend (Web Service)
1. **New +** > **Web Service**.
2. **Root Directory:** `server`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`
5. **Environment Variables:**
   - `NODE_ENV=production`
   - `JWT_SECRET=your_jwt_secret`
   - `MONGODB_URI=your_mongodb_uri`
   - `CLIENT_URL=https://<your-client-site>.onrender.com`
6. Note your backend URL (e.g., `https://tripwise-api.onrender.com`).

### Part B: Deploy Frontend (Static Site)
1. **New +** > **Static Site**.
2. **Root Directory:** `client`
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`
5. **Environment Variables:**
   - `VITE_API_URL=https://tripwise-api.onrender.com/api/v1`
6. **Redirects/Rewrites (Under Settings > Redirects/Rewrites):**
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
   *(A `client/public/_redirects` file is also included in the repo which Render automatically honors).*

---

## 🔍 Post-Deployment Verification

1. **Verify Backend Health:**
   Navigate to `https://<your-url>/api/v1/health` in your browser. You should see:
   ```json
   {
     "status": "ok",
     "app": "TripWise AI API",
     "version": "1.0.0",
     "database": {
       "connected": true,
       "mode": "mongodb"
     }
   }
   ```
2. **Verify Frontend UI:**
   Open `https://<your-url>/` in your browser. The full TripWise AI splash screen and dashboard will load.
3. **Test Demo Login:**
   - Go to `/login`.
   - Click **One-Click Demo Login (Alex Rivera)** or enter:
     - **Email:** `alex@tripwise.ai`
     - **Password:** `Password123!`
4. **Test AI Assistant & Trip Planner:**
   - Go to `/assistant` or `/planner` to test AI recommendation flows.

---

## 💡 Troubleshooting & Render Free Tier Tips

> [!NOTE]
> **Free Tier Spin-Down:**
> Render's free web services spin down after 15 minutes of inactivity. When a new request arrives, it takes ~30–50 seconds for the service to wake up ("cold start"). This is normal for Render free tier.
>
> To keep the service awake, you can set up a free uptime monitor (like [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) that pings `https://<your-url>/api/v1/health` every 10–14 minutes.

> [!TIP]
> **MongoDB IP Whitelist:**
> If you see `MongoDB connection failed` in Render logs, check your MongoDB Atlas **Network Access** settings and ensure `0.0.0.0/0` is listed so Render's dynamic IP addresses are allowed.

> [!TIP]
> **Zero-Downtime Deployments:**
> Render automatically rebuilds and redeploys your application whenever you push new commits to your GitHub `main` branch.
