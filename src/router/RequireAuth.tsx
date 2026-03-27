// RequireAuth.tsx
// Route guard that blocks access to authenticated-only routes.
//
// How it works:
//   - While the auth state is still loading (session restore from localStorage),
//     we render nothing to avoid a flash-redirect before we know who the user is.
//   - If loading is done and user is null (not logged in), redirect to /login.
//   - If the user is authenticated, render the child route via <Outlet />.
//
// Usage in the route tree:
//   <Route element={<RequireAuth />}>
//     <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
//   </Route>

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function RequireAuth() {
  const { user, isLoading } = useAuth();

  // Do not make any redirect decision while session restore is in progress.
  // Returning null renders nothing — a very brief blank screen is acceptable
  // and far better than incorrectly bouncing an authenticated user to /login.
  if (isLoading) {
    return null;
  }

  // User is not authenticated — send them to the login page.
  // `replace` replaces the current history entry so the user cannot hit
  // the browser back button to return to the protected page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated — render whatever child route matched.
  // <Outlet /> is React Router's way of saying "render the nested route here".
  return <Outlet />;
}
