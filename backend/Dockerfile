# backend/Dockerfile — CLEAN VERSION

FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend folder into the container
COPY backend/ ./backend

# Ensure backend is treated as a package
RUN touch backend/__init__.py

EXPOSE 8000

# Run the app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
