from pydantic import BaseModel
from datetime import datetime


# ─── Prescription Templates ──────────────────────────────

class PrescriptionTemplateItemCreate(BaseModel):
    medicine_name: str
    strength: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None
    sort_order: int = 0


class PrescriptionTemplateCreate(BaseModel):
    name: str
    description: str | None = None
    items: list[PrescriptionTemplateItemCreate] = []


class PrescriptionTemplateItemResponse(BaseModel):
    id: str
    medicine_name: str
    strength: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None
    sort_order: int

    model_config = {"from_attributes": True}


class PrescriptionTemplateResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    is_active: bool
    items: list[PrescriptionTemplateItemResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Investigation Templates ────────────────────────────

class InvestigationTemplateItemCreate(BaseModel):
    test_name: str
    sort_order: int = 0


class InvestigationTemplateCreate(BaseModel):
    name: str
    description: str | None = None
    items: list[InvestigationTemplateItemCreate] = []


class InvestigationTemplateItemResponse(BaseModel):
    id: str
    test_name: str
    sort_order: int

    model_config = {"from_attributes": True}


class InvestigationTemplateResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    is_active: bool
    items: list[InvestigationTemplateItemResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}
