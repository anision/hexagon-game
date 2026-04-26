FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["sh", "./entrypoint.sh"]
