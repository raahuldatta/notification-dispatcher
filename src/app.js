// Load environment variables first
require('dotenv').config();

const express = require('express');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Middleware to parse JSON payloads
app.use(express.json());

// Mount the event routes at /api/v1/events
app.use('/api/v1/events', eventRoutes);

// Catch-all route for unhandled paths
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Catch bad JSON syntax errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[App] SyntaxError: Invalid JSON payload received.');
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  // Any other database/server errors
  console.error('[Global Error Handler] Error details:', err.stack || err.message);
  return res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
