const { updateNotificationStatus } = require('./notificationService');

const queue = [];
let isProcessing = false;

/**
 * Pushes a notification task into the in-memory queue.
 * @param {Object} task - The task details.
 * @param {number} task.notification_id - The notification ID.
 * @param {string} task.recipient - The recipient's email address.
 * @param {string} task.channel - The channel ('email').
 * @param {Object} task.data - Payload data.
 */
function pushToQueue(task) {
  queue.push(task);
  console.log(`[Queue] Pushed notification task ${task.notification_id} to queue. Current queue length: ${queue.length}`);
  
  // Start worker loop if not already running
  if (!isProcessing) {
    processQueue().catch((err) => {
      console.error('[Worker Error] Uncaught error in queue processing loop:', err);
      isProcessing = false; // Reset to allow restarts if it dies
    });
  }
}

/**
 * The background worker loop.
 */
async function processQueue() {
  isProcessing = true;
  
  while (queue.length > 0) {
    const task = queue.shift();
    console.log(`[Worker] Started processing notification ${task.notification_id} for ${task.recipient}`);
    
    try {
      // 1. Simulate sending with a random delay between 500ms and 1000ms
      const delay = Math.floor(Math.random() * 501) + 500; // 500ms to 1000ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 2. Simulate 10% failure rate
      const isSuccess = Math.random() >= 0.10;
      
      if (isSuccess) {
        // Success: Update status to 'completed'
        await updateNotificationStatus(task.notification_id, 'completed', false);
        console.log(`[Worker] Notification ${task.notification_id} completed successfully in ${delay}ms`);
      } else {
        // Failure: Update status to 'failed' and increment retry_count
        await updateNotificationStatus(task.notification_id, 'failed', true);
        console.warn(`[Worker] Notification ${task.notification_id} failed simulated transmission (10% error case)`);
      }
    } catch (err) {
      console.error(`[Worker Error] Failed to process/update notification ${task.notification_id}:`, err.message);
      // Wait a moment if db error to prevent rapid infinite loops
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  isProcessing = false;
  console.log('[Worker] Queue is empty. Going idle.');
}

module.exports = {
  pushToQueue,
  getQueueLength: () => queue.length
};
