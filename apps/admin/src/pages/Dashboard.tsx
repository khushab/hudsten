import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";
import { Card, PageHeader, Spinner } from "@/components/ui";

type CountTable = "products" | "categories" | "collections" | "newsletter_subscribers";
async function count(table: CountTable): Promise<number> {
  const { count, error } = await getSupabase()
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => ({
      products: await count("products"),
      categories: await count("categories"),
      collections: await count("collections"),
      subscribers: await count("newsletter_subscribers"),
    }),
  });

  const stats = [
    { label: "Products", value: data?.products, to: "/products" },
    { label: "Categories", value: data?.categories, to: "/categories" },
    { label: "Collections", value: data?.collections, to: "/collections" },
    { label: "Subscribers", value: data?.subscribers, to: undefined },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Catalog at a glance." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <Card>
              <p className="text-2xs uppercase tracking-eyebrow text-stone-400">
                {s.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold">
                {isLoading ? <Spinner /> : (s.value ?? 0)}
              </p>
            </Card>
          );
          return s.to ? (
            <Link key={s.label} to={s.to}>
              {body}
            </Link>
          ) : (
            <div key={s.label}>{body}</div>
          );
        })}
      </div>

      <div className="mt-8">
        <Card title="Quick actions">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/products/new" className="text-ink underline underline-offset-4">
              + New product
            </Link>
            <Link to="/categories" className="text-ink underline underline-offset-4">
              Manage categories
            </Link>
            <Link to="/settings" className="text-ink underline underline-offset-4">
              Store settings
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
