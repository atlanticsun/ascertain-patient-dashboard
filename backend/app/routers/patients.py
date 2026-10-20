"""Patient, note, and summary endpoints.

The routers stay thin on purpose. Validation lives in the schemas module and
persistence is plain SQLAlchemy, so each handler reads top to bottom.
"""
import math
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app import models, schemas, summary
from app.database import get_db

router = APIRouter(prefix="/patients", tags=["patients"])

SORTABLE = {"name", "age", "last_visit", "created_at", "status", "blood_type"}


def _get_patient_or_404(patient_id: uuid.UUID, db: Session) -> models.Patient:
    patient = db.get(models.Patient, patient_id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found",
        )
    return patient


def _apply_sort(stmt, sort_by: str, sort_dir: str):
    """Apply ordering. Age sorts on date of birth, flipped, since an older
    birth date means a larger age."""
    if sort_by == "name":
        columns = (models.Patient.last_name, models.Patient.first_name)
    elif sort_by == "age":
        columns = (models.Patient.date_of_birth,)
        sort_dir = "desc" if sort_dir == "asc" else "asc"
    elif sort_by == "last_visit":
        columns = (models.Patient.updated_at,)
    elif sort_by == "status":
        columns = (models.Patient.status,)
    elif sort_by == "blood_type":
        columns = (models.Patient.blood_type,)
    else:
        columns = (models.Patient.created_at,)
    ordered = [c.desc() if sort_dir == "desc" else c.asc() for c in columns]
    return stmt.order_by(*ordered)


@router.get("", response_model=schemas.PatientPage)
def list_patients(
    page: int = Query(1, ge=1, description="Page number, starting at 1"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page, max 100"),
    q: str | None = Query(None, description="Search first and last name"),
    status: str | None = Query(None, description="Filter by patient status"),
    sort_by: str = Query("name", description="One of name, age, last_visit, created_at, status, blood_type"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List patients with pagination, search, status filter, and sorting."""
    if sort_by not in SORTABLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"sort_by must be one of {sorted(SORTABLE)}",
        )
    if status is not None and status not in schemas.STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"status must be one of {sorted(schemas.STATUSES)}",
        )

    stmt = select(models.Patient)
    count_stmt = select(func.count()).select_from(models.Patient)

    if q:
        like = f"%{q.strip()}%"
        condition = or_(
            models.Patient.first_name.ilike(like),
            models.Patient.last_name.ilike(like),
        )
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)
    if status:
        stmt = stmt.where(models.Patient.status == status)
        count_stmt = count_stmt.where(models.Patient.status == status)

    stmt = _apply_sort(stmt, sort_by, sort_dir)

    total = db.scalar(count_stmt) or 0
    items = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()
    pages = math.ceil(total / page_size) if total else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


@router.post("", response_model=schemas.PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(payload: schemas.PatientCreate, db: Session = Depends(get_db)):
    """Create a patient. Returns 201 with the new record."""
    patient = models.Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/stats")
def patient_stats(db: Session = Depends(get_db)):
    """Aggregate counts for the dashboard donut. A dedicated endpoint avoids
    paging through patients just to count them, so the chart always covers
    the full population and the ring always closes."""
    rows = db.query(models.Patient.status, func.count()).group_by(
        models.Patient.status
    ).all()
    by_status = {status: count for status, count in rows}
    return {"total": sum(by_status.values()), "by_status": by_status}


@router.get("/{patient_id}", response_model=schemas.PatientRead)
def get_patient(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    """Fetch one patient by id. Returns 404 when the id is unknown."""
    return _get_patient_or_404(patient_id, db)


@router.put("/{patient_id}", response_model=schemas.PatientRead)
def update_patient(
    patient_id: uuid.UUID,
    payload: schemas.PatientUpdate,
    db: Session = Depends(get_db),
):
    """Update any subset of a patient's fields."""
    patient = _get_patient_or_404(patient_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a patient and their notes. Returns 204 with an empty body."""
    patient = _get_patient_or_404(patient_id, db)
    db.delete(patient)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{patient_id}/notes", response_model=list[schemas.NoteRead])
def list_notes(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    """List every note for one patient, oldest first."""
    _get_patient_or_404(patient_id, db)
    stmt = (
        select(models.Note)
        .where(models.Note.patient_id == patient_id)
        .order_by(models.Note.created_at.asc())
    )
    return list(db.scalars(stmt).all())


@router.post(
    "/{patient_id}/notes",
    response_model=schemas.NoteRead,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    patient_id: uuid.UUID,
    payload: schemas.NoteCreate,
    db: Session = Depends(get_db),
):
    """Attach a clinical note to a patient."""
    _get_patient_or_404(patient_id, db)
    note = models.Note(patient_id=patient_id, content=payload.content.strip())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete(
    "/{patient_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_note(
    patient_id: uuid.UUID, note_id: uuid.UUID, db: Session = Depends(get_db)
):
    """Delete one note. Returns 404 when the note is unknown or belongs to
    a different patient."""
    note = db.get(models.Note, note_id)
    if note is None or note.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note {note_id} not found for patient {patient_id}",
        )
    db.delete(note)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{patient_id}/summary")
def get_summary(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    """Return a template based human readable summary of the patient."""
    patient = _get_patient_or_404(patient_id, db)
    notes = list(patient.notes)
    age = schemas.PatientRead.model_validate(patient).age
    patient.age = age  # make the computed age visible to the summary builder
    return {"summary": summary.build_summary(patient, notes)}
