# RentalOps Frontend

RentalOps Frontend is the client application for RentalOps, a multi-tenant B2B platform designed for short-term rental operations. It gives property managers and field operators a shared workspace to manage properties, assign work, track task execution, and report issues found on site.

This repository contains the web interface used by two main roles:

- `ADMIN`, who manages operators, properties, tasks, issue review, and the operational dashboard
- `OPERATOR`, who claims or receives tasks, updates task progress, and creates issue reports from the field

## Project Repositories

- Frontend repository: [github.com/NamelessKing/rentalops-frontend](https://github.com/NamelessKing/rentalops-frontend)
- Backend repository: [github.com/NamelessKing/rentalops-backend](https://github.com/NamelessKing/rentalops-backend)

## What The Frontend Covers

The application supports the main MVP workflow of the project:

- admin registration and login
- role-based access for admins and operators
- operator management inside a tenant workspace
- property management
- task creation with both `POOL` and `DIRECT_ASSIGNMENT` dispatch modes
- operator task views for claimed and assigned work
- task lifecycle updates from `PENDING` to `COMPLETED`
- issue report creation from the operator area
- admin review, dismissal, or conversion of issue reports into tasks
- admin dashboard with operational summary data

The frontend is built to keep the admin experience clear and structured, while the operator area stays lightweight and mobile-friendly.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Bootstrap 5
- Vitest and Testing Library

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- a running RentalOps backend instance

### Environment

Create a local environment file:

Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

macOS / Linux:

```bash
cp .env.local.example .env.local
```

Default local values:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_DEV_SERVER_HOST=127.0.0.1
VITE_DEV_SERVER_PORT=5173
```

## Run The Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app runs on `http://127.0.0.1:5173` by default.

## Available Scripts

- `npm run dev` starts the Vite development server
- `npm run build` creates the production build
- `npm run preview` previews the production build locally
- `npm run lint` runs ESLint
- `npm run test` runs tests in watch mode
- `npm run test:run` runs tests once for CI or local verification

## Backend Dependency

This frontend does not include the API server. To run the full project locally, start the backend from the companion repository:

[https://github.com/NamelessKing/rentalops-backend](https://github.com/NamelessKing/rentalops-backend)

By default, the frontend expects the backend API to be available at `http://localhost:8080`.
