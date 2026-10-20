"""Seed the database with realistic sample patients and clinical notes.

Run directly with ``python seed.py`` or let the API call ``seed_database``
on startup when the patients table holds fewer than TARGET_PATIENTS rows.
"""
import random
from datetime import date, datetime, timedelta

from sqlalchemy import func, select

from app import models
from app.database import SessionLocal

random.seed(42)

TARGET_PATIENTS = 120

# Each entry: first, last, dob, email, phone, address, blood, status,
# allergies, conditions.
PATIENTS = [
    ("Maria", "Santos", date(1985, 3, 14), "maria.santos@example.com",
     "(617) 555-0142", "142 Beacon St, Boston, MA 02115", "O+",
     "active", "Penicillin", "Hypertension"),
    ("James", "Carter", date(1972, 7, 2), "james.carter@example.com",
     "(617) 555-0119", "88 Tremont St, Boston, MA 02108", "A+",
     "active", "None", "Type 2 diabetes"),
    ("Priya", "Nair", date(1990, 11, 25), "priya.nair@example.com",
     "(857) 555-0173", "25 Marlborough St, Boston, MA 02116", "B+",
     "active", "Sulfa drugs", "Asthma"),
    ("Robert", "Kim", date(1963, 1, 30), "robert.kim@example.com",
     "(617) 555-0166", "310 Commonwealth Ave, Boston, MA 02215", "AB-",
     "critical", "Latex", "Congestive heart failure; chronic kidney disease"),
    ("Elena", "Rodriguez", date(1978, 5, 19), "elena.rodriguez@example.com",
     "(857) 555-0128", "77 W Cedar St, Boston, MA 02114", "O-",
     "active", "Peanuts", "Migraine"),
    ("David", "Okafor", date(1995, 9, 8), "david.okafor@example.com",
     "(617) 555-0191", "200 Berkeley St, Boston, MA 02116", "A-",
     "inactive", "None", "None"),
    ("Sarah", "Mitchell", date(1982, 12, 3), "sarah.mitchell@example.com",
     "(857) 555-0155", "45 Myrtle St, Boston, MA 02114", "B-",
     "active", "Codeine", "Hypothyroidism"),
    ("Michael", "Thompson", date(1958, 4, 22), "michael.thompson@example.com",
     "(617) 555-0137", "12 Joy St, Boston, MA 02114", "O+",
     "critical", "Aspirin", "COPD; atrial fibrillation"),
    ("Aisha", "Khan", date(1988, 8, 11), "aisha.khan@example.com",
     "(857) 555-0184", "90 Mt Vernon St, Boston, MA 02108", "AB+",
     "active", "None", "Gestational diabetes (resolved)"),
    ("William", "Chen", date(1975, 2, 17), "william.chen@example.com",
     "(617) 555-0121", "33 Hancock St, Boston, MA 02114", "A+",
     "active", "Shellfish", "High cholesterol"),
    ("Olivia", "Brown", date(1993, 6, 29), "olivia.brown@example.com",
     "(857) 555-0107", "18 Phillips St, Boston, MA 02114", "O-",
     "inactive", "None", "None"),
    ("Daniel", "Garcia", date(1969, 10, 5), "daniel.garcia@example.com",
     "(617) 555-0178", "66 Revere St, Boston, MA 02114", "B+",
     "active", "Ibuprofen", "Lower back pain, chronic"),
    ("Fatima", "Hassan", date(1980, 1, 12), "fatima.hassan@example.com",
     "(857) 555-0149", "41 Grove St, Boston, MA 02114", "A-",
     "active", "Penicillin; latex", "Rheumatoid arthritis"),
    ("Thomas", "Anderson", date(1955, 9, 27), "thomas.anderson@example.com",
     "(617) 555-0152", "29 Irving St, Boston, MA 02114", "O+",
     "critical", "None", "Stroke recovery; hypertension"),
    ("Grace", "Liu", date(1991, 4, 16), "grace.liu@example.com",
     "(857) 555-0114", "55 Anderson St, Boston, MA 02114", "AB-",
     "active", "None", "Anxiety"),
    ("Kevin", "Murphy", date(1986, 12, 21), "kevin.murphy@example.com",
     "(617) 555-0189", "73 Pinckney St, Boston, MA 02114", "B-",
     "inactive", "None", "None"),
    ("Nina", "Petrov", date(1974, 7, 7), "nina.petrov@example.com",
     "(857) 555-0133", "16 Louisburg Sq, Boston, MA 02108", "A+",
     "active", "Sulfa drugs", "Osteoarthritis"),
    ("Carlos", "Mendez", date(1966, 3, 3), "carlos.mendez@example.com",
     "(617) 555-0161", "8 Whittier Pl, Boston, MA 02114", "O-",
     "active", "None", "Type 2 diabetes; hypertension"),
    ("Hannah", "Kim", date(1998, 8, 23), "hannah.kim@example.com",
     "(857) 555-0198", "120 Beacon St, Boston, MA 02116", "B+",
     "active", "Peanuts; tree nuts", "Eczema"),
    ("George", "Patel", date(1960, 5, 9), "george.patel@example.com",
     "(617) 555-0103", "5 Spruce St, Boston, MA 02108", "AB+",
     "inactive", "None", "Gout"),
]

# Notes keyed by patient index, each a list of (days_ago, content).
NOTES = {
    0: [
        (12, "Blood pressure 138/88 at today's visit. Continue lisinopril 10mg daily. Recheck in 4 weeks."),
        (40, "Patient reports home readings averaging 132/84. No dizziness or side effects noted."),
    ],
    1: [
        (6, "A1C 7.1, down from 7.6. Metformin tolerated well. Discussed diet changes, patient motivated."),
        (95, "New diabetes diagnosis. Started metformin 500mg twice daily. Referred to nutrition counseling."),
    ],
    2: [
        (20, "Asthma well controlled on albuterol as needed. Peak flow stable. No ER visits in 6 months."),
    ],
    3: [
        (3, "Weight up 2kg since last week. Increased furosemide to 40mg twice daily. Daily weights ordered."),
        (18, "Echo shows EF 35 percent. Cardiology adjusted carvedilol dose. Watch renal function closely."),
        (60, "Admitted for fluid overload. Diuresed 3L. Discharged on adjusted regimen with close follow up."),
    ],
    4: [
        (25, "Migraine frequency down to 2 per month on topiramate. Mild tingling in fingers reported."),
    ],
    6: [
        (33, "TSH normalized on levothyroxine 75mcg. Energy improved. Continue current dose."),
    ],
    7: [
        (9, "COPD exacerbation treated with prednisone burst and antibiotics. Breathing improved, wheeze resolved."),
        (50, "A Fib rate controlled on metoprolol. INR therapeutic. Continue anticoagulation."),
    ],
    12: [
        (15, "Joint pain improved on methotrexate. Labs stable. Continue folic acid supplementation."),
    ],
    13: [
        (7, "Physical therapy progressing. Left side strength 4/5. Speech clearer than last month."),
        (45, "Post stroke week 6. Started outpatient rehab three times weekly. Blood pressure well controlled."),
    ],
    17: [
        (28, "A1C 6.8. Blood pressure 128/80. Both conditions at goal. Great adherence to medications."),
    ],
}


def seed_database(db) -> int:
    """Top the patients table up to TARGET_PATIENTS rows. Returns rows added."""
    existing = db.scalar(select(func.count()).select_from(models.Patient)) or 0
    added = 0

    if existing == 0:
        for index, entry in enumerate(PATIENTS):
            last_visit = datetime.now() - timedelta(days=random.randint(0, 365))
            first_seen = last_visit - timedelta(days=random.randint(30, 1200))
            patient = models.Patient(
                first_name=entry[0],
                last_name=entry[1],
                date_of_birth=entry[2],
                email=entry[3],
                phone=entry[4],
                address=entry[5],
                blood_type=entry[6],
                status=entry[7],
                allergies=entry[8],
                conditions=entry[9],
                created_at=first_seen,
                updated_at=last_visit,
            )
            db.add(patient)
            db.flush()  # assign the id so notes can reference it
            added += 1
            for days_ago, content in NOTES.get(index, []):
                db.add(
                    models.Note(
                        patient_id=patient.id,
                        content=content,
                        created_at=datetime.now() - timedelta(days=days_ago),
                    )
                )
        existing += added

    generated = _generated_patients(TARGET_PATIENTS - existing)
    for entry in generated:
        patient = models.Patient(**entry)
        db.add(patient)
        db.flush()
        added += 1
        if random.random() < 0.35:
            note_days = random.randint(2, 120)
            db.add(
                models.Note(
                    patient_id=patient.id,
                    content=random.choice(GENERATED_NOTES),
                    created_at=datetime.now() - timedelta(days=note_days),
                )
            )
    db.commit()
    return added


FIRST_NAMES = [
    "Maria", "James", "Priya", "Robert", "Elena", "David", "Sarah", "Michael",
    "Aisha", "William", "Olivia", "Daniel", "Fatima", "Thomas", "Grace",
    "Kevin", "Nina", "Carlos", "Hannah", "George", "Liam", "Emma", "Noah",
    "Ava", "Ethan", "Sophia", "Mason", "Isabella", "Lucas", "Mia",
]

LAST_NAMES = [
    "Santos", "Carter", "Nair", "Kim", "Rodriguez", "Okafor", "Mitchell",
    "Thompson", "Khan", "Chen", "Brown", "Garcia", "Hassan", "Anderson",
    "Liu", "Murphy", "Petrov", "Mendez", "Patel", "Nguyen", "Silva",
    "Kowalski", "Rossi", "Dubois", "Yamamoto", "Osei", "Larsen", "Ali",
    "Novak", "Reyes",
]

STREETS = [
    "Beacon St", "Tremont St", "Marlborough St", "Commonwealth Ave",
    "W Cedar St", "Berkeley St", "Myrtle St", "Joy St", "Mt Vernon St",
    "Hancock St", "Phillips St", "Revere St", "Grove St", "Irving St",
    "Anderson St", "Pinckney St", "Louisburg Sq", "Whittier Pl",
    "Spruce St", "Newbury St",
]

BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]

CONDITIONS = [
    "Hypertension", "Type 2 diabetes", "Asthma", "High cholesterol",
    "Hypothyroidism", "Migraine", "Osteoarthritis", "Anxiety", "Eczema",
    "Gout", "None", "COPD", "Atrial fibrillation", "Lower back pain, chronic",
    "Rheumatoid arthritis", "Congestive heart failure",
]

ALLERGIES = [
    "Penicillin", "Sulfa drugs", "Latex", "Peanuts", "Shellfish", "Aspirin",
    "Codeine", "Ibuprofen", "None",
]

GENERATED_NOTES = [
    "Routine follow up. Vitals stable, no new complaints. Continue current plan.",
    "Lab results reviewed with patient. Values within target range.",
    "Patient reports feeling well. Refills sent to pharmacy.",
    "Discussed lifestyle changes. Patient receptive, will recheck in 3 months.",
    "Mild symptoms reported. Adjusted dosage, scheduled follow up in 2 weeks.",
]


def _generated_patients(count: int) -> list:
    """Build deterministic realistic patient dicts to reach the target count."""
    patients = []
    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        dob = date(
            random.randint(1940, 2005),
            random.randint(1, 12),
            random.randint(1, 28),
        )
        status = random.choices(
            ["active", "active", "active", "inactive", "critical"],
            k=1,
        )[0]
        last_visit = datetime.now() - timedelta(days=random.randint(0, 365))
        first_seen = last_visit - timedelta(days=random.randint(30, 1200))
        patients.append(
            {
                "first_name": first,
                "last_name": last,
                "date_of_birth": dob,
                "email": f"{first.lower()}.{last.lower()}{i}@example.com",
                "phone": f"({random.choice(['617', '857'])}) 555-{random.randint(100, 999):03d}{random.randint(0, 9)}",
                "address": f"{random.randint(1, 200)} {random.choice(STREETS)}, Boston, MA 0211{random.randint(0, 9)}",
                "blood_type": random.choice(BLOOD_TYPES),
                "status": status,
                "allergies": random.choice(ALLERGIES),
                "conditions": random.choice(CONDITIONS),
                "created_at": first_seen,
                "updated_at": last_visit,
            }
        )
    return patients


if __name__ == "__main__":
    session = SessionLocal()
    try:
        count = seed_database(session)
        print(f"Seeded {count} patients")
    finally:
        session.close()
