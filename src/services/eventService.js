const { query } = require('../db/database');

/**
 * Creates a new event record in the database.
 * @param {string} eventType - The type of event (e.g. 'order_placed').
 * @param {Object} payload - The custom data payload.
 * @returns {Promise<Object>} The created event object.
 */
async function createEvent(eventType, payload) {
  const payloadStr = JSON.stringify(payload);
  const sql = `
    INSERT INTO events (event_type, payload)
    VALUES (?, ?)
  `;
  const result = await query.run(sql, [eventType, payloadStr]);
  return {
    id: result.lastID,
    event_type: eventType,
    payload
  };
}

module.exports = {
  createEvent
};
