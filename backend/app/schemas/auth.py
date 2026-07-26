from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class UserCreateRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "RECEPTIONIST"
