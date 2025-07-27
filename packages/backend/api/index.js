const { createApp } = require('../dist/app');

// Create the Express app
const app = createApp();

// Export the app as a Vercel serverless function
module.exports = app;