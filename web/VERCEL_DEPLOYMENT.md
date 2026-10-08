# Deploying FloodGuard to Vercel

FloodGuard Pro is built with Next.js 14 App Router and is 100% cloud-native, ready for 1-click deployment on [Vercel](https://vercel.com).

## Option 1: Deploy with Vercel CLI (Fastest)

1. Open your terminal in the `web` directory:
   ```bash
   cd web
   ```
2. Install the Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
3. Run the deploy command:
   ```bash
   vercel
   ```
4. For production deployment:
   ```bash
   vercel --prod
   ```

## Option 2: Deploy via GitHub Integration

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: FloodGuard v2.0 production release"
   git remote add origin https://github.com/<your-username>/floodguard.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. In the project settings, set:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
4. Click **Deploy**.

## Connecting Physical ESP32 Hardware to Vercel

Once your Vercel URL is live (e.g., `https://floodguard-live.vercel.app`):
1. Open `firmware/floodguard_esp32/Config.h`.
2. Update `BACKEND_SERVER_URL`:
   ```cpp
   #define BACKEND_SERVER_URL "https://floodguard-live.vercel.app/api/telemetry"
   ```
3. Flash the ESP32. Your hardware will stream real-time ultrasonic and rain telemetry directly into your cloud Vercel dashboard!
