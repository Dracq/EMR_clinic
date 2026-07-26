from pydantic import BaseModel
from datetime import datetime


class InvestigationCreate(BaseModel):
    patient_id: str
    appointment_id: str | None = None
    test_name: str
    description: str | None = None


class InvestigationBulkCreate(BaseModel):
    patient_id: str
    appointment_id: str | None = None
    test_names: list[str]


class InvestigationResponse(BaseModel):
    id: str
    patient_id: str
    appointment_id: str | None = None
    test_name: str
    description: str | None = None
    status: str
    ordered_by_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UploadedReportResponse(BaseModel):
    id: str
    investigation_id: str | None = None
    patient_id: str
    title: str | None = None
    file_url: str | None = None
    file_type: str | None = None
    uploaded_by_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
