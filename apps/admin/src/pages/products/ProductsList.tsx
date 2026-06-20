import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@hudsten/shared";
import { deleteProduct, listProducts } from "@/api/products";
import { useConfirm } from "@/components/Confirm";
import { Button, Card, ErrorNote, Input, PageHeader, Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success/10 text-success",
  draft: "bg-stone-200 text-stone-600",
  archived: "bg-stone-300 text-stone-700",
};

export default function ProductsList() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", search],
    queryFn: () => listProducts(search || undefined),
  });

  const del = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
  const confirm = useConfirm();

  return (
    <div>
      <PageHeader
        title="Products"
        description="Create and manage your catalog."
        actions={<Button onClick={() => navigate("/products/new")}>+ New product</Button>}
      />

      <div className="mb-4 max-w-xs">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <ErrorNote error={error} />}

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner />
          </div>
        ) : !data?.length ? (
          <p className="p-8 text-center text-sm text-stone-500">No products yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <Link to={`/products/${p.id}`} className="flex items-center gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="h-10 w-10 rounded bg-stone-200" />
                      )}
                      <span className="font-medium">{p.title}</span>
                      {p.is_featured && (
                        <span className="rounded bg-brass-100 px-1.5 py-0.5 text-2xs font-medium text-brass-800">
                          Featured
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-2xs font-medium uppercase tracking-wide",
                        STATUS_STYLE[p.status],
                      )}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">{formatPrice(p.price)}</td>
                  <td className="px-3 py-3 text-stone-500">{p.category ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          await confirm({
                            title: "Delete product?",
                            message: `"${p.title}" will be permanently deleted. This can't be undone.`,
                            confirmLabel: "Delete",
                            danger: true,
                          })
                        )
                          del.mutate(p.id);
                      }}
                      className="text-xs text-danger hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
