// useAuth.ts
// Custom hook that gives any component easy access to the auth context.
//
// Why a hook instead of importing AuthContext directly?
//   - Adds a clear error if used outside of AuthProvider
//   - Gives a stable, named API: useAuth() instead of useContext(AuthContext)
//   - If we ever change the internals of AuthContext, consumers do not change
//
// Usage:
//   const { user, login, logout } = useAuth();

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);

  // If ctx is undefined, the component calling useAuth() is not wrapped
  // inside AuthProvider — this is a developer mistake we want to catch early.
  if (ctx === undefined) {
    throw new Error('useAuth() must be used inside an <AuthProvider>.');
  }

  return ctx;
}
