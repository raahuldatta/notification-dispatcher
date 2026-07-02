const app = require('./app');
const { db, dbInitPromise } = require('./db/database');

const PORT = process.env.PORT || 3000;

// Wait for database initialization before starting the server
dbInitPromise
  .then(() => {
    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`[Server] Server is running on port ${PORT}`);
    });

    // Handle graceful shutdown signals (SIGTERM & SIGINT)
    function handleShutdown(signal) {
      console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
      
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        
        // Close the SQLite database connection
        db.close((err) => {
          if (err) {
            console.error('[Database Error] Error closing SQLite database connection:', err.message);
          } else {
            console.log('[Database] SQLite database connection closed.');
          }
          process.exit(0);
        });
      });
    }

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('[Server] Failed to initialize database:', err.message || err);
    process.exit(1);
  });
