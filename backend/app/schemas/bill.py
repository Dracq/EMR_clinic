from pydantic import BaseModel
from datetime import datetime


class BillItemCreate(BaseModel):
    description: str
    amount: float
    quantity: int = 1
    sort_order: int = 0


class BillCreate(BaseModel):
    patient_id: str
    appointment_id: str
    items: list[BillItemCreate] = []
    discount: float = 0
    payment_method: str | None = None


class BillUpdate(BaseModel):
    items: list[BillItemCreate] | None = None
    discount: float | None = None


class BillPayment(BaseModel):
    payment_method: str


class BillItemResponse(BaseModel):
    id: str
    description: str
    amount: float
    quantity: int
    sort_order: int

    model_config = {"from_attributes": True}


class BillResponse(BaseModel):
    id: str
    patient_id: str
    appointment_id: str
    subtotal: float
    discount: float
    total_amount: float
    payment_status: str
    payment_method: str | None = None
    created_by_id: str
    items: list[BillItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
