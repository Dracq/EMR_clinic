from pydantic import BaseModel
from datetime import datetime


class MedicineCreate(BaseModel):
    name: str
    strength: str | None = None
    default_dosage: str | None = None
    default_frequency: str | None = None
    default_duration: str | None = None
    category: str | None = None


class MedicineUpdate(BaseModel):
    name: str | None = None
    strength: str | None = None
    default_dosage: str | None = None
    default_frequency: str | None = None
    default_duration: str | None = None
    category: str | None = None
    is_active: bool | None = None


class MedicineResponse(BaseModel):
    id: str
    name: str
    strength: str | None = None
    default_dosage: str | None = None
    default_frequency: str | None = None
    default_duration: str | None = None
    category: str | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
