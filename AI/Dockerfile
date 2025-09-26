FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (if needed for some Python packages)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Ensure sentence-transformers is always installed
RUN pip install --no-cache-dir sentence-transformers

# Copy the rest of your code
COPY . .

# Make port configurable via environment variable
ENV PORT=8000

# Expose the port
EXPOSE $PORT

# Start the app using uvicorn
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]