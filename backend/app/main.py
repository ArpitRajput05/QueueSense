from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import organizations, queues, tickets, analytics
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QueueSense API",
    description="Backend API for QueueSense digital queue management system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all. In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(organizations.router, prefix="/api/organizations", tags=["Organizations"])
app.include_router(queues.router, prefix="/api/queues", tags=["Queues"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def read_root():
    return {"message": "Welcome to QueueSense API"}
