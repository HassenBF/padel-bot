# CORS Configuration Setup Guide

## Overview
This guide explains how to properly configure CORS for your Padel Bot v4 application to resolve cross-origin request errors.

## Changes Made

### 1. Backend CORS Configuration (`packages/backend/src/app.ts`)
- Enhanced CORS configuration with more flexible origin matching
- Added support for Vercel preview deployments
- Included regex patterns for dynamic subdomain matching
- Added proper HTTP methods and headers

### 2. Environment Variables
Updated `.env.example` files for both frontend and backend:

**Backend** (`packages/backend/.env.example`):
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PORT=3000
```

**Frontend** (`packages/frontend/.env.example`):
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Vercel Configuration
Enhanced `packages/backend/vercel.json` with:
- Production environment variables
- CORS headers at the Vercel level
- Proper routing configuration

## Deployment Setup

### Step 1: Environment Variables in Vercel

For **Backend** deployment, set these environment variables in Vercel:
```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

For **Frontend** deployment, set these environment variables in Vercel:
```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```

### Step 2: Deploy Both Services
1. Deploy backend first to get the API URL
2. Update frontend environment variable with the backend URL
3. Deploy frontend to get the frontend URL  
4. Update backend environment variable with the frontend URL
5. Redeploy backend with the updated environment variable

### Step 3: Local Development
1. Copy `.env.example` to `.env` in both packages
2. Update URLs if needed for your local setup
3. Start backend: `pnpm --filter @padel-bot/backend dev`
4. Start frontend: `pnpm --filter @padel-bot/frontend dev`

## Testing CORS Configuration

### Local Testing
```bash
# Test health endpoint
curl -X GET http://localhost:3000/api/padel/health

# Test with origin header
curl -X GET -H "Origin: http://localhost:5173" http://localhost:3000/api/padel/health
```

### Production Testing
```bash
# Test from browser console on your frontend domain
fetch('https://your-backend-domain.vercel.app/api/padel/health')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Troubleshooting

### Common Issues:
1. **Still getting CORS errors**: Check that environment variables are set correctly in Vercel
2. **Local development not working**: Ensure `.env` files exist and have correct URLs
3. **Production works but preview doesn't**: Preview deployments use different URLs, the regex patterns should handle this

### Debug Steps:
1. Check browser network tab for the actual origin being sent
2. Verify environment variables are loaded correctly
3. Check Vercel deployment logs for CORS-related errors
4. Ensure both frontend and backend are deployed and accessible

## Security Notes
- In production, avoid using `*` for Access-Control-Allow-Origin when credentials are involved
- The current configuration allows specific patterns for your Vercel deployments
- Consider implementing more restrictive CORS policies for production use