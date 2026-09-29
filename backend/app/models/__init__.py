from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import datetime
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    queues = relationship("Queue", back_populates="organization")

class Queue(Base):
    __tablename__ = "queues"
    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"))
    name = Column(String, nullable=False)
    description = Column(String)
    queue_code = Column(String, unique=True, index=True, default=generate_uuid)
    status = Column(String, default="OPEN") # OPEN, PAUSED, CLOSED
    announcement = Column(String, nullable=True) # Custom message from organization
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    qr_image_url = Column(String, nullable=True) # Could store local path or base64

    organization = relationship("Organization", back_populates="queues")
    sessions = relationship("QueueSession", back_populates="queue")

class QueueSession(Base):
    __tablename__ = "queue_sessions"
    id = Column(String, primary_key=True, default=generate_uuid)
    queue_id = Column(String, ForeignKey("queues.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    current_number = Column(Integer, default=0)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    queue = relationship("Queue", back_populates="sessions")
    tickets = relationship("QueueTicket", back_populates="session")

class QueueTicket(Base):
    __tablename__ = "queue_tickets"
    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("queue_sessions.id"))
    ticket_number = Column(String, nullable=False)
    user_id = Column(String, nullable=True) # Optional or anonymous
    status = Column(String, default="WAITING") # WAITING, CALLED, SERVING, SERVED, SKIPPED, CANCELLED
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    called_at = Column(DateTime, nullable=True)
    served_at = Column(DateTime, nullable=True)
    estimated_wait = Column(Integer, nullable=True) # In minutes
    position = Column(Integer, default=0) # current position calculation cached

    session = relationship("QueueSession", back_populates="tickets")
