from pydantic import BaseModel
from datetime import date, datetime


class ConsultationCreate(BaseModel):
    patient_id: str
    appointment_id: str
    chief_complaint: str | None = None
    history_of_present_illness: str | None = None
    past_medical_history: str | None = None
    symptoms: str | None = None
    clinical_findings: str | None = None
    diagnosis: str | None = None
    advice: str | None = None
    follow_up_date: date | None = None
    notes: str | None = None


class ConsultationUpdate(BaseModel):
    chief_complaint: str | None = None
    history_of_present_illness: str | None = None
    past_medical_history: str | None = None
    symptoms: str | None = None
    clinical_findings: str | None = None
    diagnosis: str | None = None
    advice: str | None = None
    follow_up_date: date | None = None
    notes: str | None = None


class ConsultationResponse(BaseModel):
    id: str
    patient_id: str
    appointment_id: str
    chief_complaint: str | None = None
    history_of_present_illness: str | None = None
    past_medical_history: str | None = None
    symptoms: str | None = None
    clinical_findings: str | None = None
    diagnosis: str | None = None
    advice: str | None = None
    follow_up_date: date | None = None
    notes: str | None = None
    is_signed: bool
    doctor_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
