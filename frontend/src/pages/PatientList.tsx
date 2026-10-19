import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePatients } from "../api/hooks";
import StatusBadge from "../components/StatusBadge";
import ErrorBanner from "../components/ErrorBanner";
import Pagination from "../components/Pagination";

/* Debounce the search input so typing never blocks the list. The query only
   fires 300ms after the user stops typing. */
function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "last_visit", label: "Last visit" },
] as const;

export default function PatientList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const debouncedSearch = useDebouncedValue(search, 300);

  // New searches and filters start back at page one.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const { data, isLoading, isFetching, isError, refetch } = usePatients({
    page,
    page_size: 20,
    q: debouncedSearch || undefined,
    status: statusFilter || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
  });

  function toggleSort(column: string) {
    if (column === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Link
          to="/patients/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New patient
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {isError && (
        <ErrorBanner message="Could not load patients." onRetry={() => refetch()} />
      )}

      {isLoading ? (
        <p className="text-slate-500">Loading patients…</p>
      ) : (
        data && (
          <>
            {isFetching && (
              <p className="mb-2 text-xs text-slate-400">Updating…</p>
            )}
            <div className="overflow-x-auto rounded bg-white shadow-sm">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    {COLUMNS.map((col) => (
                      <th key={col.key} className="px-4 py-2">
                        <button
                          onClick={() => toggleSort(col.key)}
                          className="font-semibold hover:text-blue-700"
                        >
                          {col.label}{" "}
                          {sortBy === col.key && (sortDir === "asc" ? "▲" : "▼")}
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-2 font-semibold">Status</th>
                    <th className="px-4 py-2 font-semibold">Blood type</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium">
                        <Link
                          to={`/patients/${p.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          {p.first_name} {p.last_name}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{p.age}</td>
                      <td className="px-4 py-2">{formatDate(p.updated_at)}</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-2">{p.blood_type || "—"}</td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          to={`/patients/${p.id}/edit`}
                          className="text-sm text-slate-500 hover:text-blue-700"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No patients match this search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPage={setPage}
            />
          </>
        )
      )}
    </div>
  );
}
