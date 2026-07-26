from pydantic import BaseModel


class SettingUpdate(BaseModel):
    key: str
    value: str


class SettingsBulkUpdate(BaseModel):
    settings: list[SettingUpdate]


class SettingResponse(BaseModel):
    key: str
    value: str | None = None

    model_config = {"from_attributes": True}
