import uuid
import shutil
import os
import io
from datetime import datetime
from fpdf import FPDF
import qrcode
import tempfile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from fuzzywuzzy import fuzz
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from ..models import (
    User,
    KYCDocument,
    OCRData,
    FaceVerification,
    LivenessLogs
)
from ..database import SessionLocal
from ..services.face_service import compare_faces
from ..services.matching_service import match_names
from ..utils.auth import get_current_user, get_db

router = APIRouter(prefix="/kyc", tags=["KYC"])

# =========================================
# PDF CERTIFICATE GENERATION
# =========================================

class KYCCertificate(FPDF):
    def header(self):
        # Draw a border
        self.set_line_width(0.5)
        self.rect(5, 5, 200, 287)
        # Company Name
        self.set_font("helvetica", "B", 20)
        self.set_text_color(15, 23, 42) # Dark Slate
        self.cell(0, 20, "Index Global Technology Pvt Ltd.(IGTAPPS)", ln=True, align="C")
        self.ln(10)

@router.get("/certificate/{user_id}")
def generate_certificate(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Auth check: Only user or admin
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.kyc_status != "VERIFIED":
        raise HTTPException(status_code=400, detail="KYC verification not completed")

    # Fetch latest documents for images and data
    doc = db.query(KYCDocument).filter(KYCDocument.user_id == user_id).order_by(KYCDocument.id.desc()).first()
    ocr = db.query(OCRData).filter(OCRData.user_id == user_id).first()

    # Create PDF in memory
    pdf = KYCCertificate()
    pdf.add_page()
    
    # Title
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 15, "KYC VERIFICATION CERTIFICATE", ln=True, align="C")
    pdf.ln(10)

    # Content
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 10, "This is to certify that the identity of:", ln=True, align="C")
    
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(59, 130, 246) # Blue-500
    pdf.cell(0, 15, f"{user.first_name} {user.last_name}".upper(), ln=True, align="C")
    
    pdf.set_font("helvetica", "", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, f"has been successfully verified on {datetime.now().strftime('%Y-%m-%d')}", ln=True, align="C")
    
    pdf.ln(10)

    # IDENTITY IMAGES SECTION
    if doc and doc.aadhaar_face_path and doc.selfie_path:
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(100, 116, 139) # Slate-500
        pdf.cell(0, 10, "VERIFIED IDENTITY EVIDENCE", ln=True, align="C")
        pdf.ln(2)
        
        # Grid for images
        y_start = pdf.get_y()
        # Aadhaar Face
        if os.path.exists(doc.aadhaar_face_path):
            pdf.image(doc.aadhaar_face_path, x=45, y=y_start, w=40, h=40)
            pdf.set_xy(45, y_start + 42)
            pdf.set_font("helvetica", "B", 8)
            pdf.cell(40, 5, "AADHAAR FACE", ln=0, align="C")
        
        # Selfie
        if os.path.exists(doc.selfie_path):
            pdf.image(doc.selfie_path, x=125, y=y_start, w=40, h=40)
            pdf.set_xy(125, y_start + 42)
            pdf.set_font("helvetica", "B", 8)
            pdf.cell(40, 5, "LIVE SELFIE", ln=0, align="C")
        
        pdf.ln(15)
    
    # Details Box
    pdf.set_xy(10, pdf.get_y() + 5)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(0, 0, 0)

    # Aadhaar Number Masking
    masked_aadhaar = "XXXXXXXXXXXX"
    if ocr and ocr.aadhaar_number:
        clean_aadhaar = "".join(filter(str.isdigit, ocr.aadhaar_number))
        if len(clean_aadhaar) >= 4:
            masked_aadhaar = "X" * (len(clean_aadhaar) - 4) + clean_aadhaar[-4:]

    # Rows
    verification_id = f"KYC-{user.id:04d}-{uuid.uuid4().hex[:8].upper()}"
    details = [
        ("Verification ID:", verification_id),
        ("Aadhaar Number:", masked_aadhaar),
        ("Date of Birth:", ocr.dob if ocr and ocr.dob else "N/A"),
        ("Email Address:", user.email),
    ]

    for label, value in details:
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(50, 8, label, ln=0)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 8, value, ln=1)

    pdf.set_font("helvetica", "B", 10)
    pdf.cell(50, 8, "Verification Status:", ln=0)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(34, 197, 94) # Green-500
    pdf.cell(0, 8, "FULLY VERIFIED", ln=1)

    # QR Code Generation
    qr_data = f"VERIFIED KYC CERTIFICATE\nID: {verification_id}\nUser: {user.first_name} {user.last_name}\nStatus: VERIFIED_IGT"
    qr = qrcode.QRCode(version=1, box_size=10, border=0)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=(15, 23, 42), back_color="white") # Match dark slate theme
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_qr:
        qr_img.save(tmp_qr.name)
        tmp_qr_path = tmp_qr.name

    # QR Code Placeholder (Real QR)
    if os.path.exists(tmp_qr_path):
        pdf.image(tmp_qr_path, x=160, y=230, w=30, h=30)
        try:
            os.unlink(tmp_qr_path)
        except:
            pass
            
    pdf.set_xy(160, 262)
    pdf.set_font("helvetica", "B", 7)
    pdf.set_text_color(59, 130, 246) # Blue-500
    pdf.cell(30, 5, "SCAN TO VERIFY", align="C")

    # Footer
    pdf.set_y(-25)
    pdf.set_text_color(148, 163, 184) # Slate-400
    pdf.set_font("helvetica", "I", 8)
    pdf.cell(0, 10, "This is an electronically generated document. No physical signature required.", align="C")

    # Output
    pdf_output = pdf.output()
    return StreamingResponse(
        io.BytesIO(pdf_output), 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=KYC_Certificate_{user_id}.pdf"}
    )

# =========================================
# MODULE 9: FACE MATCHING
# =========================================

@router.post("/face-match/{user_id}")
def face_match(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only allow user themselves or admin
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    doc = db.query(KYCDocument).filter(
        KYCDocument.user_id == user_id
    ).order_by(KYCDocument.id.desc()).first()

    if not doc:
        raise HTTPException(status_code=404, detail="KYC documents not found")

    if not doc.aadhaar_face_path:
        raise HTTPException(status_code=400, detail="Aadhaar face not extracted")

    if not doc.selfie_path:
        raise HTTPException(status_code=400, detail="Selfie not found")

    result = compare_faces(
        doc.aadhaar_face_path,
        doc.selfie_path
    )

    # Save in face_verification table
    record = db.query(FaceVerification).filter(
        FaceVerification.user_id == user_id
    ).first()

    if not record:
        record = FaceVerification(user_id=user_id)

    record.similarity_score = result["similarity"]
    record.match_status = result["match"]

    db.add(record)

    # Optional: update user status
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.kyc_status = "FACE_VERIFIED" if result["match"] else "FACE_FAILED"

    db.commit()

    return {
        "similarity": result["similarity"],
        "match": result["match"]
    }

@router.post("/validate-name/{user_id}")
def validate_name(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    ocr = db.query(OCRData).filter(OCRData.user_id == user_id).first()

    if not user or not ocr:
        raise HTTPException(status_code=404, detail="Data not found")

    full_name = f"{user.first_name} {user.last_name}"
    result = match_names(full_name, ocr.name)

    # update status
    if result["match"]:
        user.kyc_status = "NAME_VERIFIED"
    else:
        user.kyc_status = "NAME_MISMATCH"

    db.commit()
    return result

# -------------------------------------------------
# MODULE 10: Final KYC Decision Engine
# -------------------------------------------------
@router.post("/final-decision/{user_id}")
def final_kyc_decision(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 1. Fetch Records
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    ocr = db.query(OCRData).filter(OCRData.user_id == user_id).first()
    face = db.query(FaceVerification).filter(FaceVerification.user_id == user_id).first()
    liveness = db.query(LivenessLogs).filter(LivenessLogs.user_id == user_id).first()

    # 2. Evaluate Individual Modules
    ocr_passed = (
        ocr is not None 
        and ocr.confidence_score is not None 
        and ocr.confidence_score >= 0.75
    )

    liveness_passed = (
        liveness is not None 
        and liveness.status is True
    )

    name_passed = False
    name_score = 0
    if ocr and ocr.name:
        full_name = f"{user.first_name} {user.last_name}"
        name_score = fuzz.token_sort_ratio(full_name.lower(), ocr.name.lower())
        name_passed = name_score >= 80

    face_score = 0.0
    if face and face.similarity_score:
        face_score = float(face.similarity_score)

    # 3. THE DECISION MATRIX (Logic Core)
    final_status = "FAILED"
    reason = "Unknown"

    if ocr_passed and liveness_passed and name_passed:
        if face_score >= 0.50:
            final_status = "VERIFIED"
            reason = "Auto-Verified: High Match"
        elif 0.30 <= face_score < 0.50:
            final_status = "MANUAL_REVIEW"
            reason = "Flagged: Name matched but Face score low (Old Photo?)"
        else:
            final_status = "FAILED"
            reason = "Face Mismatch"
    else:
        if not ocr_passed: reason = "OCR Failed"
        elif not liveness_passed: reason = "Liveness Failed"
        elif not name_passed: reason = "Name Mismatch"

    user.kyc_status = final_status
    db.commit()

    return {
        "user_id": user_id,
        "final_status": final_status,
        "reason": reason,
        "metrics": {
            "ocr_passed": ocr_passed,
            "liveness_passed": liveness_passed,
            "name_score": name_score,
            "face_score": face_score
        }
    }

# =========================================
# CHECK CURRENT STATUS
# =========================================
@router.get("/status/{user_id}")
def get_status(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.id,
        "kyc_status": user.kyc_status,
        "rejection_reason": user.rejection_reason
    }

@router.get("/ocr/{user_id}")
def get_ocr(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    ocr = db.query(OCRData).filter(OCRData.user_id == user_id).first()
    if not ocr:
        raise HTTPException(status_code=404, detail="OCR not found")

    return {
        "name": ocr.name,
        "dob": ocr.dob,
        "aadhaar_number": ocr.aadhaar_number,
        "confidence": ocr.confidence_score
    }