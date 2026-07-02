# Event-Driven Notification Dispatcher

A lightweight backend application that demonstrates how asynchronous event processing works using **Node.js**, **Express.js**, and **SQLite**. Instead of making users wait while notifications are being sent, the API accepts the request, stores the required information, and lets a background worker handle the notification separately.

This project was built as part of a backend engineering assessment to showcase asynchronous programming, clean project structure, and non-blocking API design without using external queue systems like Redis or RabbitMQ.

---

## Tech Stack

* Node.js
* Express.js
* SQLite
* sqlite3 / better-sqlite3
* Native JavaScript In-Memory Queue

---
## 📁 Project Structure

```text
kovon-assignment-2/
│
├── src/
│   ├── controllers/
│   │   └── eventController.js
│   │
│   ├── db/
│   │   ├── database.js
│   │   ├── schema.sql
│   │   ├── database.sqlite
│   │   └── custom_test_database.sqlite
│   │
│   ├── routes/
│   │   └── eventRoutes.js
│   │
│   ├── services/
│   │   ├── eventService.js
│   │   ├── notificationService.js
│   │   └── queueWorker.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── architecture-diagram.png
├── package.json
├── package-lock.json
└── README.md
```

## Getting Started

Clone the repository.

```bash
git clone <repository-url>
```

Move into the project folder.

```bash
cd event-driven-notification-dispatcher
```

Install the dependencies.

```bash
npm install
```

Start the server.

```bash
npm start
```

For development:

```bash
npm run dev
```

The server will run on:

```
http://localhost:3000
```

---

## Database

The application uses **SQLite** for data storage.

When the application starts, it automatically creates the required database tables if they don't already exist.

Two tables are used:

* **events** – stores every incoming business event.
* **notifications** – stores notification details and their processing status.

---

## API Endpoint

### Create Event

**POST**

```
/api/v1/events
```

### Request

```json
{
  "event_type": "order_placed",
  "recipient": "user@example.com",
  "data": {
    "order_id": 101
  }
}
```

### Response

**202 Accepted**

```json
{
  "message": "Event accepted for processing",
  "tracking_id": 1,
  "notification_id": 1,
  "status": "pending"
}
```

The response is returned immediately. Notification processing continues in the background.

---

## How It Works

Here's what happens when a request reaches the API:

1. The request is validated.
2. The event is saved in the **events** table.
3. A notification record is created with a **pending** status.
4. The notification task is added to an in-memory queue.
5. The API immediately returns a **202 Accepted** response.
6. A background worker continuously watches the queue.
7. The worker simulates sending an email notification.
8. The notification status is updated to either **completed** or **failed**.
9. If a failure occurs, the retry count is increased.

---

## Error Handling

The application handles common error scenarios, including:

* Missing `event_type`
* Missing `recipient`
* Invalid request body
* Database errors
* Queue processing errors
* Notification update failures

Example validation response:

```json
{
  "error": "event_type and recipient are required"
}
```

---

## Assumptions

* Email is the default notification channel.
* Notifications are simulated using `setTimeout()`.
* Processing time is randomly delayed between **500ms and 1000ms**.
* A **10% failure rate** is intentionally introduced to demonstrate error handling.
* The queue is stored entirely in memory.

---

## Limitations

* The queue is not persistent.
* Tasks are lost if the server restarts.
* Notification sending is simulated.
* No authentication or authorization is implemented.
* Designed for demonstration purposes rather than production use.

---

## Architecture

The complete workflow is illustrated in **architecture-diagram.png** included with this project.

Flow:

```
Client
   │
   ▼
POST /api/v1/events
   │
   ▼
Express API
   │
   ▼
Validate Request
   │
   ▼
Save Event
   │
   ▼
Create Notification
   │
   ▼
Push to Queue
   │
   ├────────► Return 202 Accepted
   │
   ▼
Background Worker
   │
   ▼
Simulate Notification
   │
   ▼
Update Status in SQLite
```

---

## Future Improvements

Some ideas to extend this project:

* Retry scheduling
* Persistent queues
* Redis or RabbitMQ integration
* Real email service integration
* Docker support
* Logging and monitoring
* Unit and integration tests
* API documentation with Swagger

---

## Author

**Raahul Datta**

Backend Engineering Assessment

Thank you for reviewing this project!
