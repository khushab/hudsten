// MILESTONE 1 skeleton — proves the SPA boots with the shared design system.
// MILESTONE 3 replaces this with auth (Supabase) + the admin route guard and the
// Products / Categories / Collections / Product Types / Navigation / Settings modules.
export default function App() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-stone-200 bg-paper p-8 shadow-card">
        <p className="eyebrow">Internal Tooling</p>
        <h1 className="mt-2 text-3xl font-semibold">Hudsten Admin</h1>
        <p className="mt-3 text-sm text-stone-600">
          Scaffold is live. Authentication and the catalog management modules
          arrive in Milestone&nbsp;3 (auth → products → categories → collections
          → product types → navigation → settings).
        </p>
        <div className="mt-6 rounded-md bg-stone-100 p-3 text-xs text-stone-500">
          Reminder: this SPA uses the Supabase <strong>anon key</strong> + your
          admin JWT only. The service-role key never ships to the browser.
        </div>
      </div>
    </div>
  );
}
