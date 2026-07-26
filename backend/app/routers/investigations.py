from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import (
    Investigation, User, InvestigationStatus,
    PrescriptionTemplate, PrescriptionTemplateItem,
    InvestigationTemplate, InvestigationTemplateItem,
)
from app.schemas.investigation import InvestigationCreate, InvestigationBulkCreate, InvestigationResponse
from app.schemas.template import (
    PrescriptionTemplateCreate, PrescriptionTemplateResponse,
    InvestigationTemplateCreate, InvestigationTemplateResponse,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])


@router.post("", response_model=list[InvestigationResponse], status_code=201)
def create_investigations(
    request: InvestigationBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    investigations = []
    for test_name in request.test_names:
        inv = Investigation(
            patient_id=request.patient_id,
            appointment_id=request.appointment_id,
            test_name=test_name,
            ordered_by_id=current_user.id,
        )
        db.add(inv)
        investigations.append(inv)

    db.commit()
    for inv in investigations:
        db.refresh(inv)
    return [InvestigationResponse.model_validate(i) for i in investigations]


@router.get("/patient/{patient_id}", response_model=list[InvestigationResponse])
def get_patient_investigations(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    investigations = (
        db.query(Investigation)
        .filter(Investigation.patient_id == patient_id)
        .order_by(Investigation.created_at.desc())
        .all()
    )
    return [InvestigationResponse.model_validate(i) for i in investigations]


@router.patch("/{investigation_id}/complete", response_model=InvestigationResponse)
def complete_investigation(
    investigation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    inv.status = InvestigationStatus.COMPLETED
    db.commit()
    db.refresh(inv)
    return InvestigationResponse.model_validate(inv)


# ─── Templates Router ──────────────────────────────────

templates_router = APIRouter(prefix="/api/templates", tags=["Templates"])


# Prescription Templates
@templates_router.get("/prescriptions", response_model=list[PrescriptionTemplateResponse])
def list_prescription_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    templates = (
        db.query(PrescriptionTemplate)
        .options(joinedload(PrescriptionTemplate.items))
        .filter(PrescriptionTemplate.is_active == True)
        .order_by(PrescriptionTemplate.name)
        .all()
    )
    return [PrescriptionTemplateResponse.model_validate(t) for t in templates]


@templates_router.post("/prescriptions", response_model=PrescriptionTemplateResponse, status_code=201)
def create_prescription_template(
    request: PrescriptionTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = PrescriptionTemplate(
        name=request.name,
        description=request.description,
        created_by_id=current_user.id,
    )
    db.add(template)
    db.flush()

    for item_data in request.items:
        item = PrescriptionTemplateItem(
            template_id=template.id,
            **item_data.model_dump(),
        )
        db.add(item)

    db.commit()

    template = (
        db.query(PrescriptionTemplate)
        .options(joinedload(PrescriptionTemplate.items))
        .filter(PrescriptionTemplate.id == template.id)
        .first()
    )
    return PrescriptionTemplateResponse.model_validate(template)


@templates_router.get("/prescriptions/{template_id}", response_model=PrescriptionTemplateResponse)
def get_prescription_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = (
        db.query(PrescriptionTemplate)
        .options(joinedload(PrescriptionTemplate.items))
        .filter(PrescriptionTemplate.id == template_id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return PrescriptionTemplateResponse.model_validate(template)


# Investigation Templates
@templates_router.get("/investigations", response_model=list[InvestigationTemplateResponse])
def list_investigation_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    templates = (
        db.query(InvestigationTemplate)
        .options(joinedload(InvestigationTemplate.items))
        .filter(InvestigationTemplate.is_active == True)
        .order_by(InvestigationTemplate.name)
        .all()
    )
    return [InvestigationTemplateResponse.model_validate(t) for t in templates]


@templates_router.post("/investigations", response_model=InvestigationTemplateResponse, status_code=201)
def create_investigation_template(
    request: InvestigationTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = InvestigationTemplate(
        name=request.name,
        description=request.description,
        created_by_id=current_user.id,
    )
    db.add(template)
    db.flush()

    for item_data in request.items:
        item = InvestigationTemplateItem(
            template_id=template.id,
            **item_data.model_dump(),
        )
        db.add(item)

    db.commit()

    template = (
        db.query(InvestigationTemplate)
        .options(joinedload(InvestigationTemplate.items))
        .filter(InvestigationTemplate.id == template.id)
        .first()
    )
    return InvestigationTemplateResponse.model_validate(template)
