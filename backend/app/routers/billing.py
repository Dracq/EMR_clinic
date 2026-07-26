from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Bill, BillItem, Setting, User
from app.schemas.bill import BillCreate, BillUpdate, BillPayment, BillResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/bills", tags=["Billing"])


def _get_consultation_fee(db: Session) -> float:
    """Get consultation fee from settings."""
    setting = db.query(Setting).filter(Setting.key == "consultation_fee").first()
    return float(setting.value) if setting and setting.value else 500.0


def _recalculate_totals(bill: Bill):
    """Recalculate subtotal and total from items."""
    bill.subtotal = sum(item.amount * item.quantity for item in bill.items)
    bill.total_amount = max(0, bill.subtotal - bill.discount)


@router.post("", response_model=BillResponse, status_code=201)
def create_bill(
    request: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Bill).filter(Bill.appointment_id == request.appointment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bill already exists for this appointment")

    bill = Bill(
        patient_id=request.patient_id,
        appointment_id=request.appointment_id,
        discount=request.discount,
        created_by_id=current_user.id,
    )

    if request.payment_method:
        bill.payment_method = request.payment_method

    db.add(bill)
    db.flush()

    # If no items provided, auto-add consultation fee from settings
    if not request.items:
        fee = _get_consultation_fee(db)
        item = BillItem(
            bill_id=bill.id,
            description="Consultation Fee",
            amount=fee,
            quantity=1,
            sort_order=0,
        )
        db.add(item)
    else:
        for item_data in request.items:
            item = BillItem(
                bill_id=bill.id,
                **item_data.model_dump(),
            )
            db.add(item)

    db.commit()

    # Reload with items
    bill = (
        db.query(Bill)
        .options(joinedload(Bill.items))
        .filter(Bill.id == bill.id)
        .first()
    )
    _recalculate_totals(bill)
    db.commit()
    db.refresh(bill)

    return BillResponse.model_validate(bill)


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(
    bill_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bill = (
        db.query(Bill)
        .options(joinedload(Bill.items))
        .filter(Bill.id == bill_id)
        .first()
    )
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return BillResponse.model_validate(bill)


@router.get("/appointment/{appointment_id}", response_model=BillResponse)
def get_bill_by_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bill = (
        db.query(Bill)
        .options(joinedload(Bill.items))
        .filter(Bill.appointment_id == appointment_id)
        .first()
    )
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return BillResponse.model_validate(bill)


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(
    bill_id: str,
    request: BillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if request.discount is not None:
        bill.discount = request.discount

    if request.items is not None:
        # Replace items
        db.query(BillItem).filter(BillItem.bill_id == bill_id).delete()
        for item_data in request.items:
            item = BillItem(bill_id=bill_id, **item_data.model_dump())
            db.add(item)

    db.commit()

    bill = (
        db.query(Bill)
        .options(joinedload(Bill.items))
        .filter(Bill.id == bill_id)
        .first()
    )
    _recalculate_totals(bill)
    db.commit()
    db.refresh(bill)
    return BillResponse.model_validate(bill)


@router.patch("/{bill_id}/pay", response_model=BillResponse)
def pay_bill(
    bill_id: str,
    request: BillPayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bill = (
        db.query(Bill)
        .options(joinedload(Bill.items))
        .filter(Bill.id == bill_id)
        .first()
    )
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill.payment_status = "PAID"
    bill.payment_method = request.payment_method
    db.commit()
    db.refresh(bill)
    return BillResponse.model_validate(bill)
