from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrganizationBase(BaseModel):
    name: str
    email: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class QueueBase(BaseModel):
    name: str
    description: Optional[str] = None
    announcement: Optional[str] = None

class QueueCreate(QueueBase):
    organization_id: str

class QueueUpdate(BaseModel):
    announcement: Optional[str] = None

class QueueResponse(QueueBase):
    id: str
    organization_id: str
    queue_code: str
    status: str
    created_at: datetime
    qr_image_url: Optional[str] = None
    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    user_id: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketResponse(TicketBase):
    id: str
    session_id: str
    ticket_number: str
    status: str
    joined_at: datetime
    called_at: Optional[datetime] = None
    served_at: Optional[datetime] = None
    estimated_wait_minutes: Optional[int] = None
    position: Optional[int] = None
    people_ahead: Optional[int] = None
    class Config:
        from_attributes = True
