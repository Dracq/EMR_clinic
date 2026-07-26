import uuid
import enum
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, Date, DateTime,
    ForeignKey, Enum, JSON, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.database import Base


# ─── Enums ───────────────────────────────────────────────

class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    DOCTOR = "DOCTOR"
    RECEPTIONIST = "RECEPTIONIST"


class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    ARRIVED = "ARRIVED"
    IN_CONSULTATION = "IN_CONSULTATION"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class AppointmentType(str, enum.Enum):
    WALK_IN = "WALK_IN"
    SCHEDULED = "SCHEDULED"


class InvestigationStatus(str, enum.Enum):
    ORDERED = "ORDERED"
    COMPLETED = "COMPLETED"


class FileType(str, enum.Enum):
    PDF = "PDF"
    IMAGE = "IMAGE"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    UPI = "UPI"
    CARD = "CARD"


def generate_uuid():
    return str(uuid.uuid4())


# ─── Models ──────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(Role), nullable=False, default=Role.RECEPTIONIST)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    appointments_created = relationship("Appointment", back_populates="created_by")
    vitals_recorded = relationship("Vital", back_populates="recorded_by")
    consultations = relationship("Consultation", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    investigations_ordered = relationship("Investigation", back_populates="ordered_by")
    reports_uploaded = relationship("UploadedReport", back_populates="uploaded_by")
    bills_created = relationship("Bill", back_populates="created_by")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=generate_uuid)
    uhid = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    age = Column(Integer)
    dob = Column(Date)
    gender = Column(Enum(Gender), nullable=False)
    phone = Column(String, nullable=False, index=True)
    alternate_phone = Column(String)
    address = Column(Text)
    blood_group = Column(String)
    allergies = Column(Text)
    occupation = Column(String)
    aadhaar = Column(String)
    photo_url = Column(String)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    referral_doctor = Column(String)
    medical_alerts = Column(Text)
    is_vip = Column(Boolean, default=False)
    no_fees = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    is_high_risk = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    vitals = relationship("Vital", back_populates="patient", cascade="all, delete-orphan")
    consultations = relationship("Consultation", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="patient", cascade="all, delete-orphan")
    uploaded_reports = relationship("UploadedReport", back_populates="patient", cascade="all, delete-orphan")
    bills = relationship("Bill", back_populates="patient", cascade="all, delete-orphan")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    time_slot = Column(String)
    type = Column(Enum(AppointmentType), default=AppointmentType.SCHEDULED)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.SCHEDULED, index=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    created_by = relationship("User", back_populates="appointments_created")
    vital = relationship("Vital", back_populates="appointment", uselist=False)
    consultation = relationship("Consultation", back_populates="appointment", uselist=False)
    investigations = relationship("Investigation", back_populates="appointment")
    bill = relationship("Bill", back_populates="appointment", uselist=False)

    __table_args__ = (
        Index("ix_appointments_patient_id", "patient_id"),
    )


class Vital(Base):
    __tablename__ = "vitals"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    appointment_id = Column(String, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False)
    weight = Column(Float)
    height = Column(Float)
    bmi = Column(Float)
    blood_pressure = Column(String)
    pulse = Column(Integer)
    temperature = Column(Float)
    spo2 = Column(Integer)
    random_blood_sugar = Column(Float)
    respiratory_rate = Column(Integer)
    recorded_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="vitals")
    appointment = relationship("Appointment", back_populates="vital")
    recorded_by = relationship("User", back_populates="vitals_recorded")

    __table_args__ = (
        Index("ix_vitals_patient_id", "patient_id"),
    )


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    appointment_id = Column(String, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False)
    chief_complaint = Column(Text)
    history_of_present_illness = Column(Text)
    past_medical_history = Column(Text)
    symptoms = Column(Text)
    clinical_findings = Column(Text)
    diagnosis = Column(Text)
    advice = Column(Text)
    follow_up_date = Column(Date)
    notes = Column(Text)
    is_signed = Column(Boolean, default=False)
    doctor_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="consultations")
    appointment = relationship("Appointment", back_populates="consultation")
    doctor = relationship("User", back_populates="consultations")
    prescription = relationship("Prescription", back_populates="consultation", uselist=False)

    __table_args__ = (
        Index("ix_consultations_patient_id", "patient_id"),
    )


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    consultation_id = Column(String, ForeignKey("consultations.id", ondelete="CASCADE"), unique=True, nullable=False)
    doctor_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="prescriptions")
    consultation = relationship("Consultation", back_populates="prescription")
    doctor = relationship("User", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan", order_by="PrescriptionItem.sort_order")

    __table_args__ = (
        Index("ix_prescriptions_patient_id", "patient_id"),
    )


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    prescription_id = Column(String, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    medicine_name = Column(String, nullable=False)
    strength = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    duration = Column(String)
    instructions = Column(Text)
    sort_order = Column(Integer, default=0)

    # Relationships
    prescription = relationship("Prescription", back_populates="items")


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    appointment_id = Column(String, ForeignKey("appointments.id", ondelete="SET NULL"))
    test_name = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(InvestigationStatus), default=InvestigationStatus.ORDERED)
    ordered_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="investigations")
    appointment = relationship("Appointment", back_populates="investigations")
    ordered_by = relationship("User", back_populates="investigations_ordered")
    reports = relationship("UploadedReport", back_populates="investigation")

    __table_args__ = (
        Index("ix_investigations_patient_id", "patient_id"),
    )


class UploadedReport(Base):
    __tablename__ = "uploaded_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="SET NULL"))
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    title = Column(String)
    file_url = Column(String)
    file_type = Column(Enum(FileType))
    uploaded_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    investigation = relationship("Investigation", back_populates="reports")
    patient = relationship("Patient", back_populates="uploaded_reports")
    uploaded_by = relationship("User", back_populates="reports_uploaded")


class Bill(Base):
    __tablename__ = "bills"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    appointment_id = Column(String, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False)
    subtotal = Column(Float, default=0)
    discount = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod))
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="bills")
    appointment = relationship("Appointment", back_populates="bill")
    created_by = relationship("User", back_populates="bills_created")
    items = relationship("BillItem", back_populates="bill", cascade="all, delete-orphan", order_by="BillItem.sort_order")

    __table_args__ = (
        Index("ix_bills_patient_id", "patient_id"),
    )


class BillItem(Base):
    __tablename__ = "bill_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    bill_id = Column(String, ForeignKey("bills.id", ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    sort_order = Column(Integer, default=0)

    # Relationships
    bill = relationship("Bill", back_populates="items")


# ─── Master Data Tables ──────────────────────────────────

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    strength = Column(String)
    default_dosage = Column(String)
    default_frequency = Column(String)
    default_duration = Column(String)
    category = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PrescriptionTemplate(Base):
    __tablename__ = "prescription_templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    created_by_id = Column(String, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    items = relationship("PrescriptionTemplateItem", back_populates="template", cascade="all, delete-orphan", order_by="PrescriptionTemplateItem.sort_order")


class PrescriptionTemplateItem(Base):
    __tablename__ = "prescription_template_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    template_id = Column(String, ForeignKey("prescription_templates.id", ondelete="CASCADE"), nullable=False)
    medicine_name = Column(String, nullable=False)
    strength = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    duration = Column(String)
    instructions = Column(Text)
    sort_order = Column(Integer, default=0)

    # Relationships
    template = relationship("PrescriptionTemplate", back_populates="items")


class InvestigationTemplate(Base):
    __tablename__ = "investigation_templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    created_by_id = Column(String, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    items = relationship("InvestigationTemplateItem", back_populates="template", cascade="all, delete-orphan", order_by="InvestigationTemplateItem.sort_order")


class InvestigationTemplateItem(Base):
    __tablename__ = "investigation_template_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    template_id = Column(String, ForeignKey("investigation_templates.id", ondelete="CASCADE"), nullable=False)
    test_name = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)

    # Relationships
    template = relationship("InvestigationTemplate", back_populates="items")


class FrequentDiagnosis(Base):
    __tablename__ = "frequent_diagnoses"

    id = Column(String, primary_key=True, default=generate_uuid)
    diagnosis = Column(Text, nullable=False, unique=True)
    usage_count = Column(Integer, default=1)
    last_used_at = Column(DateTime, default=datetime.utcnow)


class Setting(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String)
    old_values = Column(JSON)
    new_values = Column(JSON)
    ip_address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
