import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Padel Bot Backend server running on http://localhost:${PORT}`);
  console.log(`📋 API Documentation available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check available at http://localhost:${PORT}/health`);
});