/**
 * Vite API Routes for Question Sync
 * 
 * This file should be imported in your main.jsx or a separate API server
 * For Vite + Node.js setup, you'll need:
 * - Express.js (or similar) for handling HTTP requests
 * - Or use Supabase Edge Functions for serverless approach
 * 
 * If using Express, register routes like:
 * app.post('/api/question-sync', syncQuestionsFromSheet);
 * app.get('/api/health', healthCheck);
 */

import express from 'express';
import { syncQuestionsFromSheet, healthCheck } from '../api/questionSync';

const router = express.Router();

// Health check
router.get('/health', healthCheck);

// Main sync endpoint
router.post('/question-sync', syncQuestionsFromSheet);

export default router;
