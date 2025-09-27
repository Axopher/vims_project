build:
	docker compose up --build -d --remove-orphans

up:
	docker compose up -d

down:
	docker compose down

down-v:
	docker compose down -v

show-logs:
	docker compose logs -f

backend-logs:
	docker compose logs -f backend

frontend-logs:
	docker compose logs -f frontend

db-logs:
	docker compose logs -f db

shell:
	docker compose exec backend python manage.py shell_plus

shell-backend:
	docker compose exec backend /bin/bash

shell-frontend:
	# frontend image might be based on node:alpine -> use sh
	docker compose exec frontend sh

shell-db:
	docker compose exec db /bin/bas

psql:
	docker compose exec db psql --username=$${POSTGRES_USER} --dbname=$${POSTGRES_DB}

tenant-create:
	@echo "Running create_tenant inside backend container..."
	docker compose exec backend python manage.py create_tenant

makemigrations:
	docker compose exec backend python manage.py makemigrations

migrate:
	docker compose exec backend python manage.py migrate --shared --noinput
	docker compose exec backend python manage.py migrate --tenant --noinput


createsuperuser:
	docker compose exec backend python manage.py createsuperuser

collectstatic:
	docker compose exec backend python manage.py collectstatic --no-input --clear


tenant-migrate:
	docker compose exec backend python manage.py migrate_schemas --shared
	docker compose exec backend python manage.py migrate_schemas --tenant

tenant-migrate-tenant:
	@echo "Usage: make tenant-migrate-tenant TENANT=tenant_name"
	docker compose exec backend python manage.py migrate_schemas --schema=$${TENANT}

tenant-create:
	docker compose exec backend python manage.py create_tenant

volume-list:
	docker volume ls

volume-inspect:
	@echo "Usage: make volume-inspect VOLUME=volume_name"
	docker volume inspect $${VOLUME}
	