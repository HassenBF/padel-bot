import { createApp } from '../dist/app.js';

// Create the Express app
const app = createApp();

// Export the app as a Vercel serverless function
export default app;