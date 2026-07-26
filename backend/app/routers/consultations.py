from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Consultation, User, FrequentDiagnosis, Role
from app.schemas.consultation import ConsultationCreate, ConsultationUpdate, ConsultationResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/consultations", tags=["Consultations"])


def _track_diagnosis(db: Session, diagnosis: str | None):
    """Track diagnosis usage for autocomplete suggestions."""
    if not diagnosis or not diagnosis.strip():
        return
    existing = db.query(FrequentDiagnosis).filter(FrequentDiagnosis.diagnosis == diagnosis.strip()).first()
    if existing:
        existing.usage_count += 1
        existing.last_used_at = datetime.utcnow()
    else:
        db.add(FrequentDiagnosis(diagnosis=diagnosis.strip()))


@router.post("", response_model=ConsultationResponse, status_code=201)
def create_consultation(
    request: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Consultation).filter(Consultation.appointment_id == request.appointment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Consultation already exists for this appointment")

    consultation = Consultation(
        **request.model_dump(),
        doctor_id=current_user.id,
    )
    db.add(consultation)

    # Track diagnosis
    _track_diagnosis(db, request.diagnosis)

    db.commit()
    db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)


@router.get("/{consultation_id}", response_model=ConsultationResponse)
def get_consultation(
    consultation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return ConsultationResponse.model_validate(consultation)


@router.get("/appointment/{appointment_id}", response_model=ConsultationResponse)
def get_consultation_by_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    consultation = db.query(Consultation).filter(Consultation.appointment_id == appointment_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found for this appointment")
    return ConsultationResponse.model_validate(consultation)


@router.put("/{consultation_id}", response_model=ConsultationResponse)
def update_consultation(
    consultation_id: str,
    request: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    # Prevent receptionist from editing signed consultations
    if consultation.is_signed and current_user.role == Role.RECEPTIONIST:
        raise HTTPException(status_code=403, detail="Cannot modify a signed consultation")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(consultation, key, value)

    # Track diagnosis
    if "diagnosis" in update_data:
        _track_diagnosis(db, update_data["diagnosis"])

    db.commit()
    db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)


@router.patch("/{consultation_id}/sign", response_model=ConsultationResponse)
def sign_consultation(
    consultation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != Role.DOCTOR:
        raise HTTPException(status_code=403, detail="Only doctors can sign consultations")

    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultation.is_signed = True
    db.commit()
    db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)


@router.get("/diagnoses/frequent")
def get_frequent_diagnoses(
    q: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(FrequentDiagnosis)
    if q:
        query = query.filter(FrequentDiagnosis.diagnosis.ilike(f"%{q}%"))
    diagnoses = query.order_by(FrequentDiagnosis.usage_count.desc()).limit(20).all()
    return [{"diagnosis": d.diagnosis, "count": d.usage_count} for d in diagnoses]
