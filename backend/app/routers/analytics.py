from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Dict, Any
from app.database import get_db
from app.models import Queue, QueueSession, QueueTicket
import pandas as pd
import numpy as np

router = APIRouter()

@router.get("/{organization_id}/dashboard", response_model=Dict[str, Any])
def get_org_analytics(organization_id: str, db: Session = Depends(get_db)):
    # 1. Fetch all tickets related to this organization
    # Join tickets -> sessions -> queues -> org
    tickets = db.query(QueueTicket).join(QueueSession).join(Queue).filter(
        Queue.organization_id == organization_id
    ).all()

    if not tickets:
        # Generate some mock data if the organization has no tickets yet
        # just so the UI has something beautiful to show!
        return _generate_mock_analytics()

    # 2. Convert to Pandas DataFrame for analysis
    data = []
    for t in tickets:
        wait_time = None
        if t.called_at and t.joined_at:
            wait_time = (t.called_at - t.joined_at).total_seconds() / 60.0
            
        data.append({
            "ticket_id": t.id,
            "status": t.status,
            "joined_at": t.joined_at,
            "called_at": t.called_at,
            "wait_time_mins": wait_time,
            "hour": t.joined_at.hour if t.joined_at else None,
            "date": t.joined_at.date() if t.joined_at else None
        })
        
    df = pd.DataFrame(data)
    
    # 3. Analyze Total Visitors
    total_visited = len(df)
    
    # 4. Analyze Wait Times (Numpy & Pandas)
    completed = df.dropna(subset=['wait_time_mins'])
    if not completed.empty:
        avg_wait_time = round(completed['wait_time_mins'].mean(), 1)
        # Add some numpy variation for stats
        wait_variance = round(np.var(completed['wait_time_mins']), 1) 
    else:
        avg_wait_time = 0
        wait_variance = 0

    # 5. Analyze Peak Hours
    if 'hour' in df.columns:
        hourly_counts = df.groupby('hour').size().reset_index(name='count')
        # Create a full 24-hour distribution just in case
        all_hours = pd.DataFrame({'hour': range(8, 20)}) # 8 AM to 7 PM
        hourly_counts = pd.merge(all_hours, hourly_counts, on='hour', how='left').fillna(0)
        peak_hours_data = hourly_counts.to_dict('records')
    else:
        peak_hours_data = []

    return {
        "total_visited": total_visited,
        "average_wait_time_mins": avg_wait_time,
        "wait_time_variance": wait_variance,
        "hourly_visits": peak_hours_data,
        "mock_data": False
    }

def _generate_mock_analytics():
    # If no data exists, we use numpy to generate a realistic looking production bell curve
    hours = list(range(8, 20))
    # Base traffic
    traffic = np.random.normal(loc=15, scale=5, size=len(hours)).astype(int)
    # Add peaks at 10 AM (index 2) and 2 PM (index 6)
    traffic[2] += 20
    traffic[6] += 25
    
    hourly_visits = [{"hour": h, "count": max(0, int(t))} for h, t in zip(hours, traffic)]
    total = sum(t["count"] for t in hourly_visits)
    
    return {
        "total_visited": total,
        "average_wait_time_mins": 14.5,
        "wait_time_variance": 3.2,
        "hourly_visits": hourly_visits,
        "mock_data": True
    }
