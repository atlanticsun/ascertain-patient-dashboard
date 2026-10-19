#!/bin/sh
# Container entrypoint: migrate the schema, then serve the API.
# Seeding happens inside the app on startup when the patients table is empty.
set -e
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
