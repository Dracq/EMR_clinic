from pydantic import BaseModel
from datetime import datetime


class PrescriptionItemCreate(BaseModel):
    medicine_name: str
    strength: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None
    sort_order: int = 0


class PrescriptionCreate(BaseModel):
    patient_id: str
    consultation_id: str
    items: list[PrescriptionItemCreate] = []


class PrescriptionItemResponse(BaseModel):
    id: str
    medicine_name: str
    strength: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None
    sort_order: int

    model_config = {"from_attributes": True}


class PrescriptionResponse(BaseModel):
    id: str
    patient_id: str
    consultation_id: str
    doctor_id: str
    items: list[PrescriptionItemResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}
