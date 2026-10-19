"""SQLAlchemy ORM models for the dashboard."""
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Patient(Base):
    """One patient record for the practice."""

    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False, default="")
    address: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    blood_type: Mapped[str] = mapped_column(String(3), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    allergies: Mapped[str] = mapped_column(Text, nullable=False, default="")
    conditions: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    notes: Mapped[list["Note"]] = relationship(
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="Note.created_at",
    )


class Note(Base):
    """One clinical note attached to a patient."""

    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    patient: Mapped[Patient] = relationship(back_populates="notes")
