from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app.models import Appointment, Patient, Bill, AppointmentStatus, PaymentStatus, User
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    # Today's appointment counts
    today_appointments = db.query(Appointment).filter(Appointment.date == today).count()
    waiting_count = db.query(Appointment).filter(
        Appointment.date == today,
        Appointment.status == AppointmentStatus.ARRIVED,
    ).count()
    in_consultation_count = db.query(Appointment).filter(
        Appointment.date == today,
        Appointment.status == AppointmentStatus.IN_CONSULTATION,
    ).count()
    completed_count = db.query(Appointment).filter(
        Appointment.date == today,
        Appointment.status == AppointmentStatus.COMPLETED,
    ).count()

    # Today's revenue
    today_revenue = (
        db.query(func.coalesce(func.sum(Bill.total_amount), 0))
        .join(Appointment)
        .filter(
            Appointment.date == today,
            Bill.payment_status == PaymentStatus.PAID,
        )
        .scalar()
    )

    # Recent patients (last 5)
    recent_patients = (
        db.query(Patient)
        .order_by(Patient.created_at.desc())
        .limit(5)
        .all()
    )

    # Total patients
    total_patients = db.query(Patient).count()

    return {
        "today_appointments": today_appointments,
        "waiting_count": waiting_count,
        "in_consultation_count": in_consultation_count,
        "completed_count": completed_count,
        "today_revenue": float(today_revenue),
        "total_patients": total_patients,
        "recent_patients": [
            {
                "id": p.id,
                "uhid": p.uhid,
                "name": p.name,
                "phone": p.phone,
                "created_at": p.created_at.isoformat(),
            }
            for p in recent_patients
        ],
    }
