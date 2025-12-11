FROM python:3.11-slim

WORKDIR /app

# copy only requirements first for better caching
COPY backend/requirements.txt ./requirements.txt

RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# copy the backend source into the container
COPY backend/ ./

EXPOSE 8000

# Run uvicorn pointing to the backend package module
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
