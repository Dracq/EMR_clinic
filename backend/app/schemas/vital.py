from pydantic import BaseModel
from datetime import datetime


class VitalCreate(BaseModel):
    patient_id: str
    appointment_id: str
    weight: float | None = None
    height: float | None = None
    blood_pressure: str | None = None
    pulse: int | None = None
    temperature: float | None = None
    spo2: int | None = None
    random_blood_sugar: float | None = None
    respiratory_rate: int | None = None


class VitalUpdate(BaseModel):
    weight: float | None = None
    height: float | None = None
    blood_pressure: str | None = None
    pulse: int | None = None
    temperature: float | None = None
    spo2: int | None = None
    random_blood_sugar: float | None = None
    respiratory_rate: int | None = None


class VitalResponse(BaseModel):
    id: str
    patient_id: str
    appointment_id: str
    weight: float | None = None
    height: float | None = None
    bmi: float | None = None
    blood_pressure: str | None = None
    pulse: int | None = None
    temperature: float | None = None
    spo2: int | None = None
    random_blood_sugar: float | None = None
    respiratory_rate: int | None = None
    recorded_by_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
