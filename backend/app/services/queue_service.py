from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Queue, QueueSession, QueueTicket
from app.services.prediction_service import predict_wait_time
import datetime

def get_or_create_daily_session(db: Session, queue_id: str) -> QueueSession:
    today = datetime.datetime.utcnow().date()
    # Find session for today
    session = db.query(QueueSession).filter(
        QueueSession.queue_id == queue_id,
        func.date(QueueSession.date) == today,
        QueueSession.status == "ACTIVE"
    ).first()
    
    if not session:
        session = QueueSession(queue_id=queue_id, date=datetime.datetime.utcnow(), current_number=0)
        db.add(session)
        db.commit()
        db.refresh(session)
    return session

def join_queue(db: Session, queue_id: str, user_id: str = None) -> QueueTicket:
    # 1. Get today's session
    session = get_or_create_daily_session(db, queue_id)
    
    # 2. Assign next number atomically (simple version using row locking if Postgres, here we just increment)
    # For SQLite this works because it's single threaded mostly, but for production PG:
    # session = db.query(QueueSession).with_for_update().filter_by(id=session.id).first()
    
    session.current_number += 1
    ticket_number = f"Q-{session.current_number:03d}"
    
    # Calculate people ahead
    people_ahead = db.query(QueueTicket).filter(
        QueueTicket.session_id == session.id,
        QueueTicket.status == "WAITING"
    ).count()
    
    estimated_wait = predict_wait_time(people_ahead)
    
    ticket = QueueTicket(
        session_id=session.id,
        ticket_number=ticket_number,
        user_id=user_id,
        status="WAITING",
        estimated_wait=estimated_wait,
        position=people_ahead + 1
    )
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

def get_ticket_status(db: Session, ticket_id: str) -> dict:
    ticket = db.query(QueueTicket).filter(QueueTicket.id == ticket_id).first()
    if not ticket:
        return None
        
    session = db.query(QueueSession).filter(QueueSession.id == ticket.session_id).first()
    
    people_ahead = db.query(QueueTicket).filter(
        QueueTicket.session_id == session.id,
        QueueTicket.status == "WAITING",
        QueueTicket.id != ticket_id,
        QueueTicket.joined_at < ticket.joined_at
    ).count()
    
    currently_serving = db.query(QueueTicket).filter(
        QueueTicket.session_id == session.id,
        QueueTicket.status == "SERVING"
    ).order_by(QueueTicket.called_at.desc()).first()
    
    serving_number = currently_serving.ticket_number if currently_serving else "None"
    
    return {
        "ticket": ticket,
        "people_ahead": people_ahead,
        "estimated_wait_minutes": predict_wait_time(people_ahead) if ticket.status == "WAITING" else 0,
        "serving_number": serving_number,
        "announcement": session.queue.announcement
    }

def call_next(db: Session, queue_id: str):
    session = get_or_create_daily_session(db, queue_id)
    
    # Mark current serving as served
    currently_serving = db.query(QueueTicket).filter(
        QueueTicket.session_id == session.id,
        QueueTicket.status == "SERVING"
    ).first()
    
    if currently_serving:
        currently_serving.status = "SERVED"
        currently_serving.served_at = datetime.datetime.utcnow()
        
    # Get next waiting
    next_ticket = db.query(QueueTicket).filter(
        QueueTicket.session_id == session.id,
        QueueTicket.status == "WAITING"
    ).order_by(QueueTicket.joined_at.asc()).first()
    
    if next_ticket:
        next_ticket.status = "SERVING"
        next_ticket.called_at = datetime.datetime.utcnow()
        
    db.commit()
    if next_ticket:
        db.refresh(next_ticket)
    return next_ticket
