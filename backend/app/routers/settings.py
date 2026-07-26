from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Setting, User
from app.schemas.setting import SettingsBulkUpdate, SettingResponse
from app.dependencies import get_current_user, require_role

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("", response_model=list[SettingResponse])
def get_all_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = db.query(Setting).order_by(Setting.key).all()
    return [SettingResponse.model_validate(s) for s in settings]


@router.get("/{key}", response_model=SettingResponse)
def get_setting(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return SettingResponse.model_validate(setting)


@router.put("", response_model=list[SettingResponse])
def update_settings(
    request: SettingsBulkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "DOCTOR")),
):
    updated = []
    for setting_data in request.settings:
        setting = db.query(Setting).filter(Setting.key == setting_data.key).first()
        if setting:
            setting.value = setting_data.value
            setting.updated_at = datetime.utcnow()
        else:
            setting = Setting(key=setting_data.key, value=setting_data.value)
            db.add(setting)
        updated.append(setting)

    db.commit()
    for s in updated:
        db.refresh(s)
    return [SettingResponse.model_validate(s) for s in updated]
