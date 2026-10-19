"""Template based patient summary builder.

No model calls and no API keys are needed. The summary is assembled from the
patient profile plus a short narrative drawn from their notes.
"""
from datetime import datetime


def _fmt_day(value: datetime | None) -> str:
    return value.strftime("%b %d, %Y") if value else "an unknown date"


def build_summary(patient, notes: list) -> str:
    """Return a human readable summary for one patient."""
    full_name = f"{patient.first_name} {patient.last_name}"
    blood = patient.blood_type or "not recorded"
    conditions = patient.conditions.strip() or "none recorded"
    allergies = patient.allergies.strip() or "none recorded"

    parts = [
        f"{full_name} is {patient.age} years old with blood type {blood}. "
        f"Recorded conditions: {conditions}. Recorded allergies: {allergies}."
    ]

    if not notes:
        parts.append("No clinical notes are on file yet.")
        return "\n\n".join(parts)

    oldest = min(n.created_at for n in notes)
    newest = max(n.created_at for n in notes)
    count_word = "note" if len(notes) == 1 else "notes"
    parts.append(
        f"There are {len(notes)} clinical {count_word} on file, "
        f"ranging from {_fmt_day(oldest)} to {_fmt_day(newest)}."
    )

    excerpts = []
    for note in notes[:3]:
        text = " ".join(note.content.split())
        if len(text) > 140:
            text = text[:140].rstrip() + "..."
        excerpts.append(f"On {_fmt_day(note.created_at)}: {text}")
    parts.append("Recent notes:\n" + "\n".join(f"- {e}" for e in excerpts))

    return "\n\n".join(parts)
