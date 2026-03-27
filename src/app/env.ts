// env.ts
// Centralises access to all Vite environment variables.
//
// Why this file exists:
//   Vite exposes env variables via import.meta.env, but accessing them
//   scattered across the codebase makes it hard to track what is required.
//   This file is the single place where we read and validate env vars —
//   if one is missing, the error surfaces here at startup, not deep in a feature.
//
// Usage:
//   import { env } from '@/app/env'
//   env.apiBaseUrl  →  "http://localhost:8080"

// Read the backend base URL defined in .env.local
// VITE_ prefix is required by Vite to expose a variable to the browser bundle
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

if (!apiBaseUrl) {
  // Fail loudly during development so the missing variable is caught immediately
  throw new Error(
    '[env] VITE_API_BASE_URL is not defined. ' +
    'Create a .env.local file with: VITE_API_BASE_URL=http://localhost:8080'
  );
}

export const env = {
  // The base URL of the Spring Boot backend (e.g. http://localhost:8080)
  apiBaseUrl,
} as const;
