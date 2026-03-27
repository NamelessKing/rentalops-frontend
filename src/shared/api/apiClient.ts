// apiClient.ts
// The single shared Axios instance used by every feature in the app.
//
// Why a shared instance instead of raw fetch/axios calls everywhere:
//   - One place to set the backend base URL
//   - One place to attach the JWT token to every request automatically
//   - One place to handle auth errors (e.g. 401 → redirect to login)
//   - Keeps feature code clean: it calls fetchTask(), not axios.get('/tasks/...')

import axios from "axios";
import { env } from "@/app/env";

// Create an Axios instance pre-configured for the RentalOps backend.
// All feature API functions import this instead of creating their own instance.
const apiClient = axios.create({
  baseURL: env.apiBaseUrl,

  // Tell the server we are sending and expecting JSON
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ────────────────────────────────────────────────────
// Runs before every outgoing request.
// Reads the JWT token saved in localStorage and attaches it as a Bearer token.
//
// Flow:
//   1. User logs in → token saved to localStorage (done in AuthProvider, Slice 1)
//   2. Any subsequent API call → this interceptor reads the token and adds:
//      Authorization: Bearer <token>
//   3. Backend validates the token and identifies the user + tenant
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    // Attach the token to the Authorization header
    // The backend expects the format: "Bearer <jwt>"
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response interceptor ───────────────────────────────────────────────────
// Runs after every response (or error) comes back from the server.
// Currently handles only the 401 Unauthorized case.
//
// Why 401 handling here and not in every feature:
//   If the token expires or is invalid, ANY request can return 401.
//   Handling it once here means features never need to think about it.
apiClient.interceptors.response.use(
  // Success path: just pass the response through unchanged
  (response) => response,

  // Error path: inspect the status code
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      // Token is missing, expired, or invalid.
      // Clear local auth state and send the user back to the login page.
      // Note: we use window.location instead of React Router here because
      // this interceptor lives outside the React component tree.
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    // Re-throw the error so the calling feature can still handle
    // other status codes (400, 403, 404, 409, etc.) as needed
    return Promise.reject(error);
  },
);

export default apiClient;
