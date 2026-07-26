from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from datetime import date, datetime
from app.database import get_db
from app.models import Appointment, Patient, User, AppointmentStatus, AppointmentType
from app.schemas.appointment import (
    AppointmentCreate, AppointmentUpdate, AppointmentStatusUpdate, AppointmentResponse,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


def _build_response(apt: Appointment) -> AppointmentResponse:
    return AppointmentResponse(
        id=apt.id,
        patient_id=apt.patient_id,
        created_by_id=apt.created_by_id,
        date=apt.date,
        time_slot=apt.time_slot,
        type=apt.type.value,
        status=apt.status.value,
        notes=apt.notes,
        created_at=apt.created_at,
        updated_at=apt.updated_at,
        patient_name=apt.patient.name if apt.patient else None,
        patient_uhid=apt.patient.uhid if apt.patient else None,
        patient_phone=apt.patient.phone if apt.patient else None,
        patient_age=apt.patient.age if apt.patient else None,
        patient_gender=apt.patient.gender.value if apt.patient else None,
        has_vitals=apt.vital is not None,
        has_consultation=apt.consultation is not None,
        has_bill=apt.bill is not None,
    )


@router.get("/today", response_model=list[AppointmentResponse])
def get_today_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    appointments = (
        db.query(Appointment)
        .options(joinedload(Appointment.patient), joinedload(Appointment.vital), joinedload(Appointment.consultation), joinedload(Appointment.bill))
        .filter(Appointment.date == today)
        .order_by(Appointment.time_slot.asc().nulls_last(), Appointment.created_at.asc())
        .all()
    )
    return [_build_response(a) for a in appointments]


@router.get("", response_model=list[AppointmentResponse])
def list_appointments(
    start_date: date = Query(None),
    end_date: date = Query(None),
    status: str = Query(None),
    patient_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Appointment)
        .options(joinedload(Appointment.patient), joinedload(Appointment.vital), joinedload(Appointment.consultation), joinedload(Appointment.bill))
    )

    if start_date:
        query = query.filter(Appointment.date >= start_date)
    if end_date:
        query = query.filter(Appointment.date <= end_date)
    if status:
        query = query.filter(Appointment.status == status)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    appointments = query.order_by(Appointment.date.desc(), Appointment.time_slot.asc().nulls_last()).limit(200).all()
    return [_build_response(a) for a in appointments]


@router.post("", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    request: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    appointment = Appointment(
        patient_id=request.patient_id,
        created_by_id=current_user.id,
        date=request.date,
        time_slot=request.time_slot,
        type=request.type,
        notes=request.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Reload with relationships
    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.patient), joinedload(Appointment.vital), joinedload(Appointment.consultation), joinedload(Appointment.bill))
        .filter(Appointment.id == appointment.id)
        .first()
    )
    return _build_response(appointment)


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: str,
    request: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.patient), joinedload(Appointment.vital), joinedload(Appointment.consultation), joinedload(Appointment.bill))
        .filter(Appointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Validate status transitions
    valid_transitions = {
        AppointmentStatus.SCHEDULED: [AppointmentStatus.ARRIVED, AppointmentStatus.CANCELLED],
        AppointmentStatus.ARRIVED: [AppointmentStatus.IN_CONSULTATION, AppointmentStatus.CANCELLED],
        AppointmentStatus.IN_CONSULTATION: [AppointmentStatus.COMPLETED],
        AppointmentStatus.COMPLETED: [],
        AppointmentStatus.CANCELLED: [AppointmentStatus.SCHEDULED],
    }

    new_status = AppointmentStatus(request.status)
    if new_status not in valid_transitions.get(appointment.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from {appointment.status.value} to {new_status.value}",
        )

    appointment.status = new_status
    db.commit()
    db.refresh(appointment)
    return _build_response(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: str,
    request: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.patient), joinedload(Appointment.vital), joinedload(Appointment.consultation), joinedload(Appointment.bill))
        .filter(Appointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(appointment, key, value)

    db.commit()
    db.refresh(appointment)
    return _build_response(appointment)
