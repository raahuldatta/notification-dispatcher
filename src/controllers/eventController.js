const { createEvent } = require('../services/eventService');
const { createNotification } = require('../services/notificationService');
const { pushToQueue } = require('../services/queueWorker');

/**
 * Handles the POST /api/v1/events route.
 * Validates the body, saves the event, creates a pending notification record,
 * pushes the notification task to the background queue, and responds immediately.
 */
async function handlePostEvent(req, res, next) {
  try {
    const { event_type, recipient, data } = req.body || {};

    // Validate type and presence of required fields
    if (typeof event_type !== 'string' || typeof recipient !== 'string') {
      return res.status(400).json({
        error: "event_type and recipient must be strings"
      });
    }

    const eventTypeTrimmed = event_type.trim();
    const recipientTrimmed = recipient.trim();

    if (!eventTypeTrimmed || !recipientTrimmed) {
      return res.status(400).json({
        error: "event_type and recipient are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientTrimmed)) {
      return res.status(400).json({
        error: "recipient must be a valid email address"
      });
    }

    // Save the event in the events table
    const event = await createEvent(eventTypeTrimmed, data || {});
    const event_id = event.id;

    // Create a notification record in the notifications table with status pending
    // Default channel is 'email'
    const notification = await createNotification(event_id, recipientTrimmed, 'email', 'pending');
    const notification_id = notification.id;

    // Push the notification task into the background queue
    pushToQueue({
      notification_id,
      recipient: recipientTrimmed,
      channel: 'email',
      data: data || {}
    });

    // Immediately return response with 202 Accepted and tracking ID
    return res.status(202).json({
      message: "Event accepted for processing",
      tracking_id: event_id,
      notification_id: notification_id,
      status: "pending"
    });
  } catch (err) {
    console.error('[Controller Error] Error processing event POST:', err.message);
    // Pass the error to the Express error-handling middleware
    return next(err);
  }
}

module.exports = {
  handlePostEvent
};
