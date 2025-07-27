# Vercel Deployment Instructions

## Simple Deployment Method

Since the complex monorepo deployment is causing issues, let's use a simpler approach:

### Step 1: Deploy Backend

1. **Create a new Vercel project for Backend**:
   - Go to Vercel dashboard
   - Import from GitHub: `HassenBF/padel-bot`
   - **Root Directory**: `packages/backend`
   - **Build Command**: `cd ../.. && pnpm install && pnpm run build:shared && cd packages/backend && pnpm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `cd ../.. && pnpm install`

2. **Environment Variables**:
   ```
   NODE_ENV=production
   ```

### Step 2: Deploy Frontend

1. **Create a new Vercel project for Frontend**:
   - Import same GitHub repository
   - **Root Directory**: `packages/frontend`
   - **Framework**: Vite
   - **Build Command**: `cd ../.. && pnpm install && pnpm run build:shared && cd packages/frontend && pnpm run build`
   - **Output Directory**: `dist`

2. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
   ```

### Step 3: Update Backend CORS

After frontend is deployed, add to backend environment:
```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Alternative: Railway + Netlify

If Vercel continues to have issues:

### Backend on Railway:
1. Connect GitHub repository
2. Set root directory: `packages/backend`
3. Build command: `cd ../.. && pnpm install && pnpm run build:shared && cd packages/backend && pnpm run build`
4. Start command: `pnpm start`

### Frontend on Netlify:
1. Connect GitHub repository
2. Build settings:
   - Base directory: `packages/frontend`
   - Build command: `cd ../.. && pnpm install && pnpm run build:shared && cd packages/frontend && pnpm run build`
   - Publish directory: `packages/frontend/dist`