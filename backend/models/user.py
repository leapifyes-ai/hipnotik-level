"""
User models
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["SuperAdmin", "Admin", "Empleado"] = "Empleado"
    language: str = "es"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: Literal["SuperAdmin", "Admin", "Empleado"] = "Empleado"
    language: str = "es"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    user: User
