# Dockerfile for VerbiTech Portfolio Assistant FastAPI Backend
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose port (default 8000)
EXPOSE 8000

# Run uvicorn with dynamic $PORT support for Render/Cloud Run
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
