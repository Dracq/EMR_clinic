from pydantic import BaseModel
from datetime import date, datetime


class PatientCreate(BaseModel):
    name: str
    age: int | None = None
    dob: date | None = None
    gender: str
    phone: str
    alternate_phone: str | None = None
    address: str | None = None
    blood_group: str | None = None
    allergies: str | None = None
    occupation: str | None = None
    aadhaar: str | None = None
    photo_url: str | None = None
    emergency_contact: str | None = None
    emergency_phone: str | None = None
    referral_doctor: str | None = None
    medical_alerts: str | None = None
    is_vip: bool = False
    no_fees: bool = False
    is_blocked: bool = False
    is_high_risk: bool = False


class PatientUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    dob: date | None = None
    gender: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    address: str | None = None
    blood_group: str | None = None
    allergies: str | None = None
    occupation: str | None = None
    aadhaar: str | None = None
    photo_url: str | None = None
    emergency_contact: str | None = None
    emergency_phone: str | None = None
    referral_doctor: str | None = None
    medical_alerts: str | None = None
    is_vip: bool | None = None
    no_fees: bool | None = None
    is_blocked: bool | None = None
    is_high_risk: bool | None = None


class PatientResponse(BaseModel):
    id: str
    uhid: str
    name: str
    age: int | None = None
    dob: date | None = None
    gender: str
    phone: str
    alternate_phone: str | None = None
    address: str | None = None
    blood_group: str | None = None
    allergies: str | None = None
    occupation: str | None = None
    aadhaar: str | None = None
    photo_url: str | None = None
    emergency_contact: str | None = None
    emergency_phone: str | None = None
    referral_doctor: str | None = None
    medical_alerts: str | None = None
    is_vip: bool
    no_fees: bool
    is_blocked: bool
    is_high_risk: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PatientListResponse(BaseModel):
    patients: list[PatientResponse]
    total: int
    page: int
    per_page: int
