from pydantic import BaseModel
import datetime
from datetime import datetime as dt_datetime


class AppointmentCreate(BaseModel):
    patient_id: str
    date: datetime.date
    time_slot: str | None = None
    type: str = "SCHEDULED"
    notes: str | None = None


class AppointmentUpdate(BaseModel):
    date: datetime.date | None = None
    time_slot: str | None = None
    notes: str | None = None


class AppointmentStatusUpdate(BaseModel):
    status: str


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    created_by_id: str
    date: datetime.date
    time_slot: str | None = None
    type: str
    status: str
    notes: str | None = None
    created_at: dt_datetime
    updated_at: dt_datetime
    patient_name: str | None = None
    patient_uhid: str | None = None
    patient_phone: str | None = None
    patient_age: int | None = None
    patient_gender: str | None = None
    has_vitals: bool = False
    has_consultation: bool = False
    has_bill: bool = False

    model_config = {"from_attributes": True}
