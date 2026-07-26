from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Prescription, PrescriptionItem, User
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])


@router.post("", response_model=PrescriptionResponse, status_code=201)
def create_prescription(
    request: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Prescription).filter(Prescription.consultation_id == request.consultation_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Prescription already exists for this consultation")

    prescription = Prescription(
        patient_id=request.patient_id,
        consultation_id=request.consultation_id,
        doctor_id=current_user.id,
    )
    db.add(prescription)
    db.flush()

    for item_data in request.items:
        item = PrescriptionItem(
            prescription_id=prescription.id,
            **item_data.model_dump(),
        )
        db.add(item)

    db.commit()

    # Reload with items
    prescription = (
        db.query(Prescription)
        .options(joinedload(Prescription.items))
        .filter(Prescription.id == prescription.id)
        .first()
    )
    return PrescriptionResponse.model_validate(prescription)


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prescription = (
        db.query(Prescription)
        .options(joinedload(Prescription.items))
        .filter(Prescription.id == prescription_id)
        .first()
    )
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return PrescriptionResponse.model_validate(prescription)


@router.get("/consultation/{consultation_id}", response_model=PrescriptionResponse)
def get_prescription_by_consultation(
    consultation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prescription = (
        db.query(Prescription)
        .options(joinedload(Prescription.items))
        .filter(Prescription.consultation_id == consultation_id)
        .first()
    )
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return PrescriptionResponse.model_validate(prescription)


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(
    prescription_id: str,
    request: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Delete existing items and replace
    db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == prescription_id).delete()

    for item_data in request.items:
        item = PrescriptionItem(
            prescription_id=prescription_id,
            **item_data.model_dump(),
        )
        db.add(item)

    db.commit()

    prescription = (
        db.query(Prescription)
        .options(joinedload(Prescription.items))
        .filter(Prescription.id == prescription_id)
        .first()
    )
    return PrescriptionResponse.model_validate(prescription)
