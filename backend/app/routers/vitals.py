from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Vital, User
from app.schemas.vital import VitalCreate, VitalUpdate, VitalResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/vitals", tags=["Vitals"])


def _calculate_bmi(weight: float | None, height: float | None) -> float | None:
    """Calculate BMI from weight (kg) and height (cm)."""
    if weight and height and height > 0:
        height_m = height / 100
        return round(weight / (height_m * height_m), 1)
    return None


@router.post("", response_model=VitalResponse, status_code=201)
def create_vital(
    request: VitalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if vitals already exist for this appointment
    existing = db.query(Vital).filter(Vital.appointment_id == request.appointment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vitals already recorded for this appointment")

    bmi = _calculate_bmi(request.weight, request.height)
    vital = Vital(
        **request.model_dump(),
        bmi=bmi,
        recorded_by_id=current_user.id,
    )
    db.add(vital)
    db.commit()
    db.refresh(vital)
    return VitalResponse.model_validate(vital)


@router.get("/appointment/{appointment_id}", response_model=VitalResponse)
def get_vital_by_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vital = db.query(Vital).filter(Vital.appointment_id == appointment_id).first()
    if not vital:
        raise HTTPException(status_code=404, detail="Vitals not found for this appointment")
    return VitalResponse.model_validate(vital)


@router.put("/{vital_id}", response_model=VitalResponse)
def update_vital(
    vital_id: str,
    request: VitalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vital = db.query(Vital).filter(Vital.id == vital_id).first()
    if not vital:
        raise HTTPException(status_code=404, detail="Vital not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(vital, key, value)

    # Recalculate BMI
    vital.bmi = _calculate_bmi(vital.weight, vital.height)

    db.commit()
    db.refresh(vital)
    return VitalResponse.model_validate(vital)
