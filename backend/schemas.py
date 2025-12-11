from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    admin = "admin"
    member = "member"

class RuleAction(str, Enum):
    AUTO_ACCEPT = "AUTO_ACCEPT"
    AUTO_REJECT = "AUTO_REJECT"

class UserCreate(BaseModel):
    name: str
    role: Role = Role.member
    credits: Optional[int] = 100

class UserOut(BaseModel):
    id: int
    name: str
    role: Role
    credits: int
    class Config:
        orm_mode = True

class RuleCreate(BaseModel):
    pattern: str
    action: RuleAction

class RuleOut(BaseModel):
    id: int
    pattern: str
    action: RuleAction
    class Config:
        orm_mode = True

class CommandCreate(BaseModel):
    command_text: str

class CommandOut(BaseModel):
    id: int
    command_text: str
    status: str
    result: Optional[str]
    created_at: datetime
    class Config:
        orm_mode = True

class UserCreateResponse(BaseModel):
    id: int
    name: str
    role: Role
    credits: int
    api_key: str

    class Config:
        orm_mode = True
