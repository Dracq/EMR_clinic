from datetime import date
from sqlalchemy.orm import Session
from app.models import Patient


def generate_uhid(db: Session) -> str:
    """Generate a unique UHID in format UHID-YYYYMMDD-NNNN."""
    today = date.today()
    date_str = today.strftime("%Y%m%d")
    prefix = f"UHID-{date_str}-"

    # Find the last UHID for today
    last_patient = (
        db.query(Patient)
        .filter(Patient.uhid.like(f"{prefix}%"))
        .order_by(Patient.uhid.desc())
        .first()
    )

    if last_patient:
        last_num = int(last_patient.uhid.split("-")[-1])
        new_num = last_num + 1
    else:
        new_num = 1

    return f"{prefix}{new_num:04d}"
