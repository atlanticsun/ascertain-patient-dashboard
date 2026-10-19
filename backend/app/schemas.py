"""Pydantic schemas for request validation and API responses.

All input validation lives here so the routers stay thin. FastAPI turns
validation failures into 422 responses automatically.
"""
import re
from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    computed_field,
    field_validator,
)

BLOOD_TYPES = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
STATUSES = {"active", "inactive", "critical"}


class PatientBase(BaseModel):
    """Fields shared by patient create, update, and read schemas."""

    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    email: EmailStr
    phone: str = Field(min_length=7, max_length=30)
    address: str = Field(default="", max_length=255)
    blood_type: str = Field(default="", max_length=3)
    status: str = Field(default="active", max_length=20)
    allergies: str = ""
    conditions: str = ""

    @field_validator("date_of_birth")
    @classmethod
    def dob_not_in_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return value

    @field_validator("phone")
    @classmethod
    def phone_has_enough_digits(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value or "")
        if not 7 <= len(digits) <= 15:
            raise ValueError("Phone number must contain 7 to 15 digits")
        return value

    @field_validator("blood_type")
    @classmethod
    def blood_type_known(cls, value: str) -> str:
        if value and value not in BLOOD_TYPES:
            raise ValueError(f"Blood type must be one of {sorted(BLOOD_TYPES)}")
        return value

    @field_validator("status")
    @classmethod
    def status_known(cls, value: str) -> str:
        if value not in STATUSES:
            raise ValueError(f"Status must be one of {sorted(STATUSES)}")
        return value


class PatientCreate(PatientBase):
    """Payload for POST /patients."""


class PatientUpdate(BaseModel):
    """Payload for PUT /patients/{id}. Every field is optional."""

    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, min_length=7, max_length=30)
    address: Optional[str] = Field(default=None, max_length=255)
    blood_type: Optional[str] = Field(default=None, max_length=3)
    status: Optional[str] = Field(default=None, max_length=20)
    allergies: Optional[str] = None
    conditions: Optional[str] = None

    @field_validator("date_of_birth")
    @classmethod
    def dob_not_in_future(cls, value: Optional[date]) -> Optional[date]:
        if value is not None and value > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return value

    @field_validator("blood_type")
    @classmethod
    def blood_type_known(cls, value: Optional[str]) -> Optional[str]:
        if value and value not in BLOOD_TYPES:
            raise ValueError(f"Blood type must be one of {sorted(BLOOD_TYPES)}")
        return value

    @field_validator("status")
    @classmethod
    def status_known(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in STATUSES:
            raise ValueError(f"Status must be one of {sorted(STATUSES)}")
        return value


class PatientRead(PatientBase):
    """Patient as returned by the API, with age computed from date of birth."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def age(self) -> int:
        today = date.today()
        dob = self.date_of_birth
        return (
            today.year
            - dob.year
            - ((today.month, today.day) < (dob.month, dob.day))
        )


class PatientPage(BaseModel):
    """Paginated patient list envelope."""

    items: list[PatientRead]
    total: int
    page: int
    page_size: int
    pages: int


class NoteCreate(BaseModel):
    """Payload for POST /patients/{id}/notes."""

    content: str = Field(min_length=1, max_length=5000)


class NoteRead(BaseModel):
    """Note as returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    content: str
    created_at: datetime
