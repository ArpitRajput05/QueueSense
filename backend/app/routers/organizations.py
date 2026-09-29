from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Organization
from app.schemas import OrganizationCreate, OrganizationResponse

router = APIRouter()

@router.post("/", response_model=OrganizationResponse)
def create_organization(org: OrganizationCreate, db: Session = Depends(get_db)):
    db_org = Organization(name=org.name, email=org.email)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(org_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.get("/", response_model=List[OrganizationResponse])
def get_organizations(db: Session = Depends(get_db)):
    return db.query(Organization).all()
