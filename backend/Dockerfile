FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt requirements-production.txt ./
RUN pip install --no-cache-dir -r requirements-production.txt
COPY . .
RUN groupadd --gid 10001 clinic && useradd --uid 10001 --gid clinic clinic && mkdir -p /data && chown clinic:clinic /data
USER clinic
ENV FLASK_APP=run:app FLASK_DEBUG=False PYTHONUNBUFFERED=1
EXPOSE 5000
CMD ["sh", "-c", "flask db upgrade && exec gunicorn --bind 0.0.0.0:5000 --workers 1 --threads 4 --access-logfile - --error-logfile - run:app"]
