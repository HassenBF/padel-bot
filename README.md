# Padel Bot V4 Monorepo

A TypeScript monorepo with React frontend and Node.js Express backend.

## Structure

```
packages/
├── backend/     # Node.js Express API server
├── frontend/    # React TypeScript application
└── shared/      # Shared types and utilities
```

## Prerequisites

- Node.js >= 18
- pnpm >= 8

## Setup

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev
```

## Available Scripts

- `pnpm dev` - Start both frontend (http://localhost:5173) and backend (http://localhost:3000)
- `pnpm build` - Build all packages for production
- `pnpm clean` - Clean all build artifacts

## Development

- Frontend runs on http://localhost:5173
- Backend API runs on http://localhost:3000
- Frontend proxies `/api` requests to backend