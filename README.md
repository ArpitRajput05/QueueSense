# QueueSense

QueueSense is a real-world digital queue management system designed to eliminate physical waiting lines. 

Organizations can create a queue, automatically generate a QR code, and display it. Customers simply scan the QR code with their phone to join the queue and receive a digital token. They can then track their live position and estimated wait time, allowing them to wait comfortably anywhere until their turn.

## Architecture

*   **Frontend**: React, Vite, Tailwind CSS, React Router
*   **Backend**: Python, FastAPI, SQLAlchemy, Pydantic
*   **Database**: PostgreSQL (preferred), fallback to SQLite for local dev
*   **QR Code**: Generated automatically on the backend (`qrcode` library)

The system is designed with a mobile-first philosophy for users (scanning a QR) and a rich dashboard for organizations (managing the queue).

## Tech Stack

*   React + Vite
*   Tailwind CSS
*   Python 3 + FastAPI
*   SQLAlchemy (ORM)

## Workflows

### Organization Workflow
1. Creates an organization profile and a specific service queue (e.g., "General Checkup").
2. The backend generates a unique secure QR code for that queue.
3. The organization downloads, prints, or displays this QR code at their location.
4. The dashboard allows the admin to monitor waiting users, current serving token, and click "CALL NEXT".

### User Workflow
1. Approaches the location and scans the displayed QR code.
2. The smartphone opens the QueueSense web app directly to that queue's page.
3. User clicks "Join Queue".
4. Receives a digital token (e.g., `Q-023`) and sees how many people are ahead and estimated wait time.
5. The screen updates live as the admin calls the next numbers.

### QR Workflow
The QR code encodes a URL like `http://<domain>/join/<unique_queue_code>`. It safely identifies the queue without exposing database primary keys. 

## Setup Instructions

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Use postgresql for production: postgresql://user:pass@localhost/dbname
DATABASE_URL=sqlite:///./queue_sense.db
FRONTEND_URL=http://localhost:5173
```

### Database Setup

The FastAPI application will automatically create the required database tables on startup using SQLAlchemy's `Base.metadata.create_all()`. For production, Alembic should be used for migrations.

### Running FastAPI Backend

1. Navigate to `backend` directory
2. Create virtual environment: `python -m venv venv`
3. Activate: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn app.main:app --reload`
6. Swagger API Documentation will be available at `http://localhost:8000/docs`

### Running React Frontend

1. Navigate to `frontend` directory
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

## API Documentation

FastAPI provides automatic interactive API documentation at `/docs`.
Key endpoints:
*   `POST /api/organizations` - Create org
*   `POST /api/queues` - Create queue
*   `POST /api/queues/{id}/join` - Join a queue
*   `POST /api/queues/{id}/next` - Call next ticket
*   `GET /api/tickets/{id}/status` - Live ticket status
