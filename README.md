# Patient Dashboard

A patient management dashboard for a medical practice. React frontend, FastAPI
backend, PostgreSQL database. The whole thing runs with one command.

## Architecture

```
Browser
  |
  v
web (nginx serving the React build)  -->  api (FastAPI on uvicorn)  -->  db (Postgres 16)
       port 3000                                port 8000                        port 5432
```

The frontend talks to the API over HTTP with JSON. The API owns all validation
and persistence. Postgres holds the patients and notes tables. On first startup
the API tops the table up to 120 sample patients (with notes on many of them) when the patients
table is empty.

## Tech choices and why

* **FastAPI.** Python is my strongest backend language. FastAPI gives request
  validation through Pydantic and auto generated API docs with very little
  code.
* **TanStack Query instead of Redux.** Almost all frontend state is server
  state: patients, notes, summaries. TanStack Query handles caching, loading
  states, and background refetching, so there is no hand written store and far
  less boilerplate than Redux would need.
* **Tailwind CSS.** Utility classes keep styling next to the markup, which
  makes a responsive layout fast to build without separate CSS files.
* **Alembic.** Migrations version the schema, so any developer recreates the
  exact same database with one command.
* **Template based summaries, no LLM.** The summary endpoint assembles text
  from the patient record and their notes. That keeps the project runnable
  with no API keys, no cost, and deterministic output. An LLM call is a clean
  swap later behind the same endpoint.

## Design

* **Calming clinical palette.** The UI uses a soft blue mist background with
  dusty teal as the primary color, a nature inspired sage, and warm neutrals.
  This follows evidence based healthcare design research: cool blue green
  tones are linked to lower patient stress and anxiety (a 2020 study in the
  Health Environments Research and Design Journal measured a 14 percent
  anxiety reduction against sterile white), while warm neutrals avoid the
  higher stress response that plain white clinical spaces can trigger.
  Critical states use a softened clay instead of alarm red, urgent enough to
  read at a glance without overstimulation.
* **Interactive status donut.** The dashboard chart is a hand rolled SVG donut
  (no chart library): hovering a slice pushes it outward and updates the
  center readout with the count and share; clicking a slice (or a stat card)
  opens the patient list pre filtered to that status via a `?status=` URL
  parameter. Slices animate in with a staggered pop, and the chart is keyboard
  accessible.

## Run it with Docker

You need Docker and the compose plugin.

```bash
cp .env.example .env
docker compose up --build
```

Then open http://localhost:3000 for the app. The API is at
http://localhost:8000, with interactive docs at http://localhost:8000/docs.

To stop: `docker compose down`. Data lives in a named volume, so patients you
add survive restarts.

## Run the pieces separately

Useful when you are working on one side at a time.

Backend (needs a reachable Postgres; `docker compose up db` starts just that):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/dashboard
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
printf 'VITE_API_URL=http://localhost:8000\n' > .env
npm run dev
```

Open http://localhost:5173.

## API endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | /health | Health check, returns `{"status": "ok"}` |
| GET | /patients | List with `page`, `page_size` (max 100), `q` search, `status` filter, `sort_by`, `sort_dir` |
| POST | /patients | Create a patient, returns 201 |
| GET | /patients/{id} | One patient, 404 when unknown |
| PUT | /patients/{id} | Update any subset of fields |
| DELETE | /patients/{id} | Delete patient and notes, returns 204 |
| GET | /patients/{id}/notes | List notes, oldest first |
| POST | /patients/{id}/notes | Add a note, returns 201 |
| DELETE | /patients/{id}/notes/{note_id} | Delete a note, returns 204 |
| GET | /patients/{id}/summary | Template based readable summary |

Validation failures return 422 with field level details. Missing records
return 404 with a plain message.

## Environment variables

| Variable | Used by | Default |
| -------- | ------- | ------- |
| POSTGRES_USER | compose, db | postgres |
| POSTGRES_PASSWORD | compose, db | postgres |
| POSTGRES_DB | compose, db | dashboard |
| DATABASE_URL | api | postgresql+psycopg2://postgres:postgres@db:5432/dashboard |
| VITE_API_URL | web (build arg) | http://localhost:8000 |

## What was left out and why

* **Auth.** The brief does not ask for user types yet, so login would be the
  next slice, not part of this one.
* **LLM summaries.** Template output is deterministic and needs no keys. The
  endpoint shape stays the same if an LLM is plugged in later.
* **List virtualization.** Pagination plus debounced search keeps the DOM
  small. Virtualization earns its complexity past a few thousand rows.
* **Tests.** The 2 to 4 hour budget went to the working app and the Docker
  setup. API tests with pytest and component tests would be the next addition.
