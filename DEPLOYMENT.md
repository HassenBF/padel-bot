# Deployment Guide - Padel Bot v4

## Quick Deploy (Recommended)

### Option 1: Vercel (Easiest)

#### Prerequisites
- GitHub account
- Vercel account (free)

#### Steps:
1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/padel-bot-v4.git
   git push -u origin main
   ```

2. **Deploy Frontend**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Set root directory to `packages/frontend`
   - Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.vercel.app/api`
   - Deploy

3. **Deploy Backend**:
   - Create new Vercel project
   - Select same GitHub repository
   - Set root directory to `packages/backend`
   - Add environment variables:
     - `NODE_ENV=production`
     - `FRONTEND_URL=https://your-frontend-url.vercel.app`
   - Deploy

### Option 2: Netlify + Railway

#### Frontend (Netlify):
1. Connect GitHub repository to Netlify
2. Set build command: `cd ../.. && pnpm run build`
3. Set publish directory: `packages/frontend/dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.railway.app/api`

#### Backend (Railway):
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Set root directory to `packages/backend`
4. Add environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend-url.netlify.app`

### Option 3: Render.com (All-in-one)

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repository
4. Configure:
   - Build Command: `pnpm install && pnpm run build`
   - Start Command: `cd packages/backend && pnpm start`
5. Add environment variables as needed

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Backend (.env)
```
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build shared package**:
   ```bash
   pnpm run build:shared
   ```

3. **Start development servers**:
   ```bash
   pnpm run dev
   ```

4. **Access the app**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Production Build

```bash
# Build everything
pnpm run build

# Start backend only
cd packages/backend
pnpm start
```

## Troubleshooting

### CORS Issues
- Make sure `FRONTEND_URL` environment variable is set correctly in backend
- Check that frontend domain is in the CORS allowlist

### Build Failures
- Ensure pnpm is installed: `npm install -g pnpm`
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Build shared package first: `pnpm run build:shared`

### API Connection Issues
- Verify `VITE_API_BASE_URL` in frontend environment
- Check that backend is deployed and accessible
- Test API endpoints directly in browser

## Features

✅ Multi-club padel availability checking  
✅ Real-time slot filtering by time and day  
✅ Direct booking links  
✅ Responsive mobile-friendly UI  
✅ Error handling and loading states  

## Supported Clubs

- Mouratoglou Country Club
- All In Padel Mougins  
- Stadium-Antibes
- Padel Riviera

---

**Estimated deployment time**: 15-30 minutes  
**Cost**: Free (on free tiers)  
**Maintenance**: Zero configuration needed