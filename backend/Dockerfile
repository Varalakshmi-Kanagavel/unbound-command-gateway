# backend/Dockerfile — REPLACE existing file with this
FROM python:3.11-slim

WORKDIR /app

# copy requirements from the repo's backend folder
COPY backend/requirements.txt ./requirements.txt

RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# copy the backend directory into the image at /app/backend
COPY backend/ ./backend

# ensure backend is an importable package (create __init__.py if missing)
RUN python - <<'PY'\nimport os\np='backend/__init__.py'\nif not os.path.exists(p):\n    open(p,'w').close()\nPY

EXPOSE 8000

# Run uvicorn using the package path (so relative imports inside backend work)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
