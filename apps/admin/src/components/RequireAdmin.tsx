import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button, Spinner } from "@/components/ui";

/**
 * Route guard. The REAL enforcement is RLS (is_admin()) on every write — this guard is
 * only UX: it keeps non-admins out of the UI. A logged-in non-admin gets a clear message.
 */
export function RequireAdmin() {
  const { session, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-2xl font-semibold">Not authorized</h1>
        <p className="max-w-sm text-sm text-stone-500">
          This account isn't an admin. Ask an existing admin to promote your
          profile (profiles.role = 'admin').
        </p>
        <Button variant="secondary" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
