from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Queue, QueueSession, QueueTicket
from app.schemas import QueueCreate, QueueResponse, TicketResponse, QueueUpdate
from app.services.qr_service import generate_qr_for_queue
from app.services.queue_service import join_queue, call_next, get_ticket_status

router = APIRouter()

@router.post("/", response_model=QueueResponse)
def create_queue(queue: QueueCreate, db: Session = Depends(get_db)):
    db_queue = Queue(
        organization_id=queue.organization_id,
        name=queue.name,
        description=queue.description
    )
    db.add(db_queue)
    db.commit()
    db.refresh(db_queue)
    
    # Generate QR after getting queue_code
    db_queue.qr_image_url = generate_qr_for_queue(db_queue.queue_code)
    db.commit()
    db.refresh(db_queue)
    
    return db_queue

@router.get("/{queue_id}", response_model=QueueResponse)
def get_queue(queue_id: str, db: Session = Depends(get_db)):
    queue = db.query(Queue).filter(Queue.id == queue_id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    return queue

@router.get("/by-code/{queue_code}", response_model=QueueResponse)
def get_queue_by_code(queue_code: str, db: Session = Depends(get_db)):
    queue = db.query(Queue).filter(Queue.queue_code == queue_code).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    return queue

@router.post("/{queue_id}/join")
def join_a_queue(queue_id: str, db: Session = Depends(get_db)):
    queue = db.query(Queue).filter(Queue.id == queue_id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    if queue.status != "OPEN":
        raise HTTPException(status_code=400, detail="Queue is not open")
        
    ticket = join_queue(db, queue_id)
    status_info = get_ticket_status(db, ticket.id)
    return {
        "ticket_id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "position": ticket.position,
        "people_ahead": status_info["people_ahead"],
        "estimated_wait_minutes": status_info["estimated_wait_minutes"]
    }

@router.post("/{queue_id}/next")
def call_next_ticket(queue_id: str, db: Session = Depends(get_db)):
    ticket = call_next(db, queue_id)
    if not ticket:
        return {"message": "Queue is empty"}
    return {"called_ticket": ticket.ticket_number}

@router.patch("/{queue_id}", response_model=QueueResponse)
def update_queue(queue_id: str, queue_update: QueueUpdate, db: Session = Depends(get_db)):
    queue = db.query(Queue).filter(Queue.id == queue_id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    
    if queue_update.announcement is not None:
        queue.announcement = queue_update.announcement
    
    db.commit()
    db.refresh(queue)
    return queue

@router.get("/{queue_id}/status")
def get_queue_status(queue_id: str, db: Session = Depends(get_db)):
    # This is for the admin dashboard
    queue = db.query(Queue).filter(Queue.id == queue_id).first()
    if not queue:
         raise HTTPException(status_code=404, detail="Queue not found")
    
    session = db.query(QueueSession).filter(QueueSession.queue_id == queue_id).order_by(QueueSession.date.desc()).first()
    if not session:
        return {"waiting": 0, "currently_serving": None, "next_ticket": None, "tickets": [], "announcement": queue.announcement}
        
    waiting_tickets = db.query(QueueTicket).filter(
        QueueTicket.session_id == session.id,
        QueueTicket.status == "WAITING"
    ).order_by(QueueTicket.joined_at.asc()).all()
    
    serving_ticket = db.query(QueueTicket).filter(
        QueueTicket.session_id == session.id,
        QueueTicket.status == "SERVING"
    ).order_by(QueueTicket.called_at.desc()).first()
    
    return {
        "waiting_count": len(waiting_tickets),
        "currently_serving": serving_ticket.ticket_number if serving_ticket else None,
        "next_ticket": waiting_tickets[0].ticket_number if len(waiting_tickets) > 0 else None,
        "tickets": [{"id": t.id, "number": t.ticket_number, "status": t.status} for t in waiting_tickets],
        "announcement": queue.announcement
    }
