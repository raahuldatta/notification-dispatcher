const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || './src/db/database.sqlite';

// Ensure the directory for the database exists
const dbDir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Promise to track database initialization success/failure
let dbInitResolve;
let dbInitReject;
const dbInitPromise = new Promise((resolve, reject) => {
  dbInitResolve = resolve;
  dbInitReject = reject;
});

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
    dbInitReject(err);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
    
    // Enable busy timeout to prevent transient SQLITE_BUSY database locking errors
    db.configure('busyTimeout', 5000);
    
    // Enable foreign key support
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Failed to enable foreign key support:', pragmaErr.message);
      }
    });

    initializeDatabase();
  }
});

function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (err) => {
      if (err) {
        console.error('Failed to initialize database schema:', err.message);
        dbInitReject(err);
      } else {
        console.log('Database schema initialized successfully.');
        dbInitResolve();
      }
    });
  } else {
    console.warn(`Schema file not found at ${schemaPath}`);
    dbInitResolve();
  }
}

// Promisified database helpers
const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      // Use standard function so `this` context represents the executed statement
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

module.exports = {
  db,
  query,
  dbInitPromise
};
