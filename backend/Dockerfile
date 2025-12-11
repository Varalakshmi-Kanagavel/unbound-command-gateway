# backend/Dockerfile (replace existing file)
FROM python:3.11-slim

WORKDIR /app

# copy only requirements first for better caching
COPY backend/requirements.txt ./requirements.txt

RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# copy the backend source into the container
COPY backend/ ./

# expose port and run uvicorn
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
