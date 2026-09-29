from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import QueueTicket
from app.services.queue_service import get_ticket_status

router = APIRouter()

@router.get("/{ticket_id}/status")
def get_status(ticket_id: str, db: Session = Depends(get_db)):
    status_info = get_ticket_status(db, ticket_id)
    if not status_info:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    ticket = status_info["ticket"]
    
    return {
        "ticket_id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "status": ticket.status,
        "people_ahead": status_info["people_ahead"],
        "estimated_wait_minutes": status_info["estimated_wait_minutes"],
        "serving_number": status_info["serving_number"],
        "announcement": status_info["announcement"]
    }
