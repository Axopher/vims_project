# VIMS Multi-Tenant Project

A multi-tenant school/institute management system built with **Django**, **PostgreSQL**, **React (Vite)**, and **Docker**.

---

## Table of Contents

- [Setup](#setup)
- [Guide](#guide)
- [Docker Commands](#docker-commands)

---

## Setup

1. Clone the repository:

```bash
git clone https://github.com/Axopher/vims_project.git
cd vims
```

2. Copy .env.example to .env for backend and frontend:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **Edit `.env`** with your local configuration:

```bash
PROJECT_NAME=vims
POSTGRES_DB=vims_db
POSTGRES_USER=vims_user
POSTGRES_PASSWORD=secret
POSTGRES_HOST=db
POSTGRES_PORT=5432

DJANGO_SECRET_KEY=<generate_your_secret_key>
ENVIRONMENT=local
SECRET_JWT_SIGNING_KEY=<generate_jwt_key>

VITE_API_BASE_DOMAIN=http://localhost:8000
DEV=true
```

4. **Build and start Docker containers**:

```bash
make build
```

5. **Create the first default(public schema) for your domain**:

```bash
make tenant-create
```

6. **Create a superuser for Django admin**:

```bash
make createsuperuser
```

## Guide

Congratulations! Your project is now up and running. You can:

1. Log in to the Django admin panel: [http://localhost:8000/admin](http://localhost:8000/admin)
2. Create your first customer (tenant) through the admin panel.
3. Each tenant will have its own isolated database schema for secure, independent data.

---

## Docker Commands

| Command                                      | Description                             |
| -------------------------------------------- | --------------------------------------- |
| `make build`                                 | Build and start all containers          |
| `make up`                                    | Start containers                        |
| `make down`                                  | Stop containers                         |
| `make down-v`                                | Stop containers and remove volumes      |
| `make show-logs`                             | Show all container logs                 |
| `make backend-logs`                          | Show backend logs                       |
| `make frontend-logs`                         | Show frontend logs                      |
| `make db-logs`                               | Show database logs                      |
| `make shell`                                 | Open Django shell                       |
| `make shell-backend`                         | Enter backend container shell           |
| `make shell-frontend`                        | Enter frontend container shell          |
| `make shell-db`                              | Enter database container shell          |
| `make migrate`                               | Run all shared and tenant migrations    |
| `make tenant-migrate`                        | Migrate all tenant schemas              |
| `make tenant-migrate-tenant TENANT=<tenant>` | Migrate a specific tenant               |
| `make tenant-create`                         | Create the first tenant (public schema) |
