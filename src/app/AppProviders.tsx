// AppProviders.tsx
// The root wrapper that sets up all global providers for the app.
//
// Why a dedicated file for providers?
//   main.tsx should stay minimal (just mount the React root).
//   All provider composition lives here so it is easy to add
//   a new provider later (e.g. a toast provider) in one place.
//
// Current provider tree:
//   BrowserRouter  — gives the whole app access to React Router hooks
//     AuthProvider — gives the whole app access to the auth state

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthProvider';
import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      {/*
        AuthProvider is inside BrowserRouter so that in the future,
        if we need to redirect (e.g. to /login) from inside AuthProvider,
        we can use the useNavigate hook from React Router.
      */}
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}
