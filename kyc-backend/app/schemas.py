from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str = Field(pattern=r"^\d{10}$")
    pan_number: str = Field(pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool
    user_id: int
    kyc_status: str

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    mobile: str
    pan_number: str
    kyc_status: str
    is_admin: bool
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True
