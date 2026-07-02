const { query } = require('../db/database');

/**
 * Creates a new notification record in the database.
 * @param {number} eventId - The ID of the associated event.
 * @param {string} recipient - The recipient's email address.
 * @param {string} channel - The communication channel (e.g. 'email').
 * @param {string} status - The initial status (e.g. 'pending').
 * @returns {Promise<Object>} The created notification object.
 */
async function createNotification(eventId, recipient, channel = 'email', status = 'pending') {
  const sql = `
    INSERT INTO notifications (event_id, recipient, channel, status, retry_count)
    VALUES (?, ?, ?, ?, 0)
  `;
  const result = await query.run(sql, [eventId, recipient, channel, status]);
  return {
    id: result.lastID,
    event_id: eventId,
    recipient,
    channel,
    status,
    retry_count: 0
  };
}

/**
 * Updates the status and retry count of a notification record.
 * @param {number} notificationId - The ID of the notification.
 * @param {string} status - The new status ('completed' or 'failed').
 * @param {boolean} incrementRetry - Whether to increment the retry_count by 1.
 * @returns {Promise<void>}
 */
async function updateNotificationStatus(notificationId, status, incrementRetry = false) {
  const sql = incrementRetry
    ? `
      UPDATE notifications
      SET status = ?, retry_count = retry_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    : `
      UPDATE notifications
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
  await query.run(sql, [status, notificationId]);
}

module.exports = {
  createNotification,
  updateNotificationStatus
};
