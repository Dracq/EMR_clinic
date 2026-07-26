from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Medicine, User
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])


@router.get("", response_model=list[MedicineResponse])
def list_medicines(
    search: str = Query(None),
    category: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Medicine).filter(Medicine.is_active == True)

    if search:
        query = query.filter(Medicine.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(Medicine.category == category)

    medicines = query.order_by(Medicine.name).limit(50).all()
    return [MedicineResponse.model_validate(m) for m in medicines]


@router.post("", response_model=MedicineResponse, status_code=201)
def create_medicine(
    request: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    medicine = Medicine(**request.model_dump())
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return MedicineResponse.model_validate(medicine)


@router.put("/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: str,
    request: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(medicine, key, value)

    db.commit()
    db.refresh(medicine)
    return MedicineResponse.model_validate(medicine)
