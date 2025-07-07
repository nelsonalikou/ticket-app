# 🎟️ Ticket App

A full-stack Ticket & User Management System built with:

- ⚙️ **NestJS v8** for the backend (User & Ticket CRUD)
- 🧩 **Angular v12** for the frontend (Ticket management UI)

---

## 📁 Project Structure

```
ticket-app/
├── ticket-backend/        # NestJS v8 server (API)
├── ticket-frontend/       # Angular v12 client
└── docker-compose.yml
```

Both the `ticket-frontend` and `ticket-backend` folders contain their respective `Dockerfile`.

---

## 🚀 Getting Started

Deploying on docker is recommanded as almost all the dependencies (database and rabbitmq) are already met.

### 1. Clone the Repository

```bash
git clone https://github.com/nelsonalikou/ticket-app.git
cd ticket-app
```

---

## ⚙️ Backend Setup (NestJS v8)

### 🔧 Prerequisites

- Node.js v14+
- npm v6+
- PostgreSQL or MySQL (based on your DB config)

### 📦 Install Dependencies

```bash
cd ticket-backend
npm install
```

### ⚙️ Environment Configuration

1. Copy the example env file and rename it (.env.example is located in ticket-app):

```bash
cp .env.example .env
cp .env ./ticket-backend
```

2. Ensure your `.env` file (inside `/ticket-backend`) looks like this:

```env
APP_ENV=local

DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=ticketdb

RABBITMQ_DEFAULT_USER=user
RABBITMQ_DEFAULT_PASS=password
RABBITMQ_URL=amqp://user:password@rabbitmq:5672/
RABBITMQ_TICKETS_QUEUE_NAME=bulk_delete_queue

MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=ticketdb
MYSQL_USER=testuser
MYSQL_PASSWORD=testpassword

CORS_ALLOWED_ORIGINS=http://localhost
CORS_ALLOWED_METHODS=GET, POST, PUT, DELETE, OPTIONS, PATCH
CORS_ALLOWED_CREDENTIALS=true
```

### 🧪 Run the Backend Server

```bash
npm run start:dev
```

> The backend will be available at: **http://localhost:3000**
> The swagger will be available at: **http://localhost:3000/api/docs**

---

## 🌐 Frontend Setup (Angular v12)

### 🔧 Prerequisites

- Node.js v14
- Angular CLI v12

Check your version:

```bash
ng version
```

If not v12, update globally:

```bash
npm uninstall -g @angular/cli
npm install -g @angular/cli@12
```

### 📦 Install Dependencies

```bash
cd ticket-frontend
npm install
```

### 🚦 Run the Angular Dev Server

```bash
ng serve
```

> The frontend will be available at: **http://localhost:4200**

Make sure the backend server is running on `http://localhost:3000`.

---

## 🐳 Docker Deployment

### 🛠️ Pre-setup: SQL Initialization

Create a `init.sql` file at the root of the project:

```sql
CREATE DATABASE IF NOT EXISTS ticketdb;

USE ticketdb;

CREATE USER IF NOT EXISTS 'testuser'@'%' IDENTIFIED BY 'testpassword';
GRANT ALL PRIVILEGES ON ticketdb.* TO 'testuser'@'%';

FLUSH PRIVILEGES;
```

Ensure the credentials match those in your `.env` file.

### 📦 Build and Start Containers

From the root directory:

```bash
docker-compose up --build
```

---

## ✅ Features

- 📄 Ticket listing with pagination
- 🔍 Ticket search
- ✏️ Add / Edit / Delete tickets
- 📦 Bulk delete support (with rabbitmq queuing)
- 🧑 User CRUD (backend only)

---

## 📌 Notes

- Ensure **CORS** is properly configured in the NestJS backend.
- The API base URL is defined in `ticket.service.ts` in the Angular app.

---

## 👩‍💻 Developer Tips

- Use **Postman** to test API endpoints quickly.
- Check browser and terminal logs for helpful debugging info.
- To reset the database, either run fresh migrations or manually drop tables (based on your ORM).

---

## 📃 License

This project is licensed under the **MIT License**.