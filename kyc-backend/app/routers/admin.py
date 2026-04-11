from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from ..models import User, KYCDocument, OCRData, FaceVerification, LivenessLogs
from ..schemas import UserResponse
from ..utils.auth import get_current_admin, get_db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    # 1. Status Distribution
    status_counts = db.query(User.kyc_status, func.count(User.id)).group_by(User.kyc_status).all()
    status_data = [{"status": s.replace('_', ' '), "count": c} for s, c in status_counts if s is not None]

    # 2. Registration Trend (Last 7 Days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    trend_counts = db.query(func.date(User.created_at), func.count(User.id))\
        .filter(User.created_at >= seven_days_ago)\
        .group_by(func.date(User.created_at))\
        .all()
    
    trend_data = [{"date": str(d), "users": c} for d, c in trend_counts]

    return {
        "status_distribution": status_data,
        "registration_trend": trend_data
    }

@router.get("/kyc-requests")
def get_kyc_requests(
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    # Fetch all users who have interacted with the KYC system
    users = db.query(User).filter(
        User.kyc_status.is_not(None)
    ).all()
    
    results = []
    for user in users:
        doc = db.query(KYCDocument).filter(KYCDocument.user_id == user.id).order_by(KYCDocument.id.desc()).first()
        ocr = db.query(OCRData).filter(OCRData.user_id == user.id).first()
        face = db.query(FaceVerification).filter(FaceVerification.user_id == user.id).first()
        liveness = db.query(LivenessLogs).filter(LivenessLogs.user_id == user.id).first()
        
        results.append({
            "user": user,
            "documents": doc,
            "ocr": ocr,
            "face": face,
            "liveness": liveness
        })
        
    return results

@router.post("/approve/{user_id}")
def approve_kyc(
    user_id: int, 
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.kyc_status = "VERIFIED"
    user.rejection_reason = None
    db.commit()
    return {"msg": f"User {user_id} approved successfully"}

@router.post("/reject/{user_id}")
def reject_kyc(
    user_id: int, 
    reason: str,
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.kyc_status = "FAILED"
    user.rejection_reason = reason
    db.commit()
    return {"msg": f"User {user_id} rejected with reason: {reason}"}
