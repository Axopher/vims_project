#!/bin/bash
echo "Running entrypoint script..."

# Wait for DB (optional defensive loop)
if [ -n "${POSTGRES_HOST:-}" ]; then
  echo "Waiting for database at ${POSTGRES_HOST}:${POSTGRES_PORT:-5432}..."
  retries=20
  while ! pg_isready -h "${POSTGRES_HOST:-localhost}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-postgres}" >/dev/null 2>&1; do
    ((retries--)) || { echo "Database not ready, exiting"; exit 1; }
    sleep 1
  done
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --shared --noinput
python manage.py migrate --tenant --noinput

# Start the Django development server
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000