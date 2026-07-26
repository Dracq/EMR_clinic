from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models import Patient, User
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("")
def global_search(
    q: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Global fuzzy search across patients by UHID, name, phone."""
    search_term = f"%{q}%"

    patients = (
        db.query(Patient)
        .filter(
            or_(
                Patient.uhid.ilike(search_term),
                Patient.name.ilike(search_term),
                Patient.phone.ilike(search_term),
            )
        )
        .order_by(Patient.name)
        .limit(20)
        .all()
    )

    return {
        "patients": [
            {
                "id": p.id,
                "uhid": p.uhid,
                "name": p.name,
                "phone": p.phone,
                "age": p.age,
                "gender": p.gender.value,
                "is_vip": p.is_vip,
                "is_high_risk": p.is_high_risk,
            }
            for p in patients
        ],
    }
