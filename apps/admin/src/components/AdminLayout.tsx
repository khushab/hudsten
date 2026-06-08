import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/collections", label: "Collections" },
  { to: "/product-types", label: "Product Types" },
  { to: "/navigation", label: "Navigation" },
  { to: "/settings", label: "Settings" },
];

export function AdminLayout() {
  const { session, signOut } = useAuth();

  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-60 shrink-0 flex-col border-r border-stone-200 bg-paper">
        <div className="px-5 py-5">
          <p className="font-display text-xl font-extrabold tracking-tightest">
            HUDSTEN
          </p>
          <p className="text-2xs uppercase tracking-eyebrow text-stone-400">Admin</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-ink text-paper" : "text-stone-600 hover:bg-stone-100",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-stone-200 p-3">
          <p className="truncate px-2 pb-2 text-xs text-stone-400">
            {session?.user.email}
          </p>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden bg-stone-100">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
