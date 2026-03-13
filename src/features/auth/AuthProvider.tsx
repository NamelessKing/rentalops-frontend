// AuthProvider.tsx
// The React component that holds authentication state for the entire app.
//
// What it does:
//   1. On mount, checks localStorage for an existing token and restores
//      the user session — so a page refresh does not log the user out.
//   2. Provides login() and logout() functions to the rest of the app
//      through React context.
//   3. Wraps the whole app in AuthContext.Provider so any component
//      can call useAuth() to read the current user.
//
// Where it lives in the tree:
//   <BrowserRouter>          ← handles routing
//     <AuthProvider>         ← this file: handles auth state
//       <App />              ← the rest of the app
//     </AuthProvider>
//   </BrowserRouter>

import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './AuthContext';
import type { AuthUser } from './types';

interface AuthProviderProps {
  // ReactNode covers anything React can render: a single element,
  // multiple elements, strings, null, etc.
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // The authenticated user object, or null when not logged in
  const [user, setUser] = useState<AuthUser | null>(null);

  // True during the initial session restore from localStorage.
  // Starts as true so child components do not render prematurely
  // before we know whether the user is already logged in.
  const [isLoading, setIsLoading] = useState(true);

  // ── Session restore on first render ─────────────────────────────────────
  // useEffect with an empty dependency array runs once after the first render.
  // Here we check if there is already a valid session in localStorage
  // so returning users are not forced to log in again after a page refresh.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('authUser');

    if (token && stored) {
      try {
        // Parse the JSON string we saved at login time back into an AuthUser object
        const parsed: AuthUser = JSON.parse(stored);
        setUser(parsed);
      } catch {
        // If the stored value is corrupted, clear storage and start fresh
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authUser');
      }
    }

    // We are done checking — allow the rest of the app to render
    setIsLoading(false);
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  // Called by the LoginPage after a successful POST /auth/login response.
  // Saves the token and user so they survive a page refresh.
  function login(token: string, userData: AuthUser) {
    localStorage.setItem('accessToken', token);
    // We store the user object as a JSON string because localStorage
    // only supports string values
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
  }

  // ── Logout ───────────────────────────────────────────────────────────────
  // Clears all auth data and resets user to null.
  // The apiClient interceptor also calls localStorage.removeItem on 401,
  // but that does not update the React state — this function does both.
  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authUser');
    setUser(null);
  }

  // Build the context value object that all consumers will receive
  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
