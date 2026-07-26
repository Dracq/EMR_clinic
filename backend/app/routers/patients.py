from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models import Patient, User
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, PatientListResponse
from app.dependencies import get_current_user
from app.utils.uhid import generate_uhid

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.get("", response_model=PatientListResponse)
def list_patients(
    search: str = Query(None, description="Search by name, phone, or UHID"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Patient)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Patient.name.ilike(search_term),
                Patient.phone.ilike(search_term),
                Patient.uhid.ilike(search_term),
            )
        )

    total = query.count()
    patients = (
        query
        .order_by(Patient.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return PatientListResponse(
        patients=[PatientResponse.model_validate(p) for p in patients],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.post("", response_model=PatientResponse, status_code=201)
def create_patient(
    request: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uhid = generate_uhid(db)
    patient = Patient(uhid=uhid, **request.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return PatientResponse.model_validate(patient)


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse.model_validate(patient)


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: str,
    request: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)
    return PatientResponse.model_validate(patient)


@router.get("/{patient_id}/timeline")
def get_patient_timeline(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get chronological timeline of all patient events."""
    from app.models import Appointment, Vital, Consultation, Prescription, Investigation, Bill

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    timeline = []

    # Appointments
    appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
    for apt in appointments:
        timeline.append({
            "type": "appointment",
            "id": apt.id,
            "date": apt.created_at.isoformat(),
            "data": {
                "date": apt.date.isoformat(),
                "time_slot": apt.time_slot,
                "status": apt.status.value,
                "type": apt.type.value,
            }
        })

    # Vitals
    vitals = db.query(Vital).filter(Vital.patient_id == patient_id).all()
    for v in vitals:
        timeline.append({
            "type": "vital",
            "id": v.id,
            "date": v.created_at.isoformat(),
            "data": {
                "weight": v.weight,
                "height": v.height,
                "bmi": v.bmi,
                "blood_pressure": v.blood_pressure,
                "pulse": v.pulse,
                "temperature": v.temperature,
                "spo2": v.spo2,
            }
        })

    # Consultations
    consultations = db.query(Consultation).filter(Consultation.patient_id == patient_id).all()
    for c in consultations:
        timeline.append({
            "type": "consultation",
            "id": c.id,
            "date": c.created_at.isoformat(),
            "data": {
                "chief_complaint": c.chief_complaint,
                "diagnosis": c.diagnosis,
                "is_signed": c.is_signed,
            }
        })

    # Prescriptions
    prescriptions = (
        db.query(Prescription)
        .filter(Prescription.patient_id == patient_id)
        .all()
    )
    for p in prescriptions:
        items = [{"medicine_name": i.medicine_name, "dosage": i.dosage, "frequency": i.frequency, "duration": i.duration} for i in p.items]
        timeline.append({
            "type": "prescription",
            "id": p.id,
            "date": p.created_at.isoformat(),
            "data": {"items": items}
        })

    # Investigations
    investigations = db.query(Investigation).filter(Investigation.patient_id == patient_id).all()
    for inv in investigations:
        timeline.append({
            "type": "investigation",
            "id": inv.id,
            "date": inv.created_at.isoformat(),
            "data": {
                "test_name": inv.test_name,
                "status": inv.status.value,
            }
        })

    # Bills
    bills = db.query(Bill).filter(Bill.patient_id == patient_id).all()
    for b in bills:
        timeline.append({
            "type": "bill",
            "id": b.id,
            "date": b.created_at.isoformat(),
            "data": {
                "total_amount": b.total_amount,
                "payment_status": b.payment_status.value,
                "payment_method": b.payment_method.value if b.payment_method else None,
            }
        })

    # Sort by date descending
    timeline.sort(key=lambda x: x["date"], reverse=True)
    return timeline
