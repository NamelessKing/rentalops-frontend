// AuthContext.ts
// Defines the shape of the authentication context shared across the entire app.
//
// Why a separate file for just the context definition?
//   We separate the context object from the provider component so that:
//   - AuthProvider.tsx only contains the logic (state, login, logout)
//   - Any file can import just the types (AuthContextValue) without pulling
//     in the React component tree
//
// Usage:
//   Never use AuthContext directly — use the useAuth() hook instead.
//   The hook adds a safety check and gives a cleaner API.

import { createContext } from 'react';
import type { AuthUser } from './types';

// The shape of the value every consumer of this context will receive.
export interface AuthContextValue {
  // The currently authenticated user, or null if not logged in
  user: AuthUser | null;

  // True while we are reading the token from localStorage on initial load.
  // Components should show a spinner or nothing while this is true
  // to avoid a flash of the login page for already-authenticated users.
  isLoading: boolean;

  // Call this after a successful login API response.
  // Saves the token to localStorage and updates the user in context.
  login: (token: string, user: AuthUser) => void;

  // Call this when the user clicks logout or when a 401 is received.
  // Clears the token from localStorage and resets the user to null.
  logout: () => void;
}

// Create the context with undefined as the default value.
// undefined signals that a component is trying to use the context
// outside of an AuthProvider — the useAuth hook catches this case.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
