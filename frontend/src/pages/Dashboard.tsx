import { Link } from "react-router-dom";
import { usePatients } from "../api/hooks";
import ErrorBanner from "../components/ErrorBanner";

const STATUS_ORDER = ["active", "inactive", "critical"] as const;
const BAR_COLORS: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-slate-400",
  critical: "bg-red-500",
};

/* Home page: a simple overview of patient counts by status, rendered as CSS
   bars. No chart library needed for three numbers. */
export default function Dashboard() {
  const { data, isLoading, isError, refetch } = usePatients({ page: 1, page_size: 100 });

  if (isLoading) {
    return <p className="text-slate-500">Loading overview…</p>;
  }
  if (isError || !data) {
    return <ErrorBanner message="Could not load the dashboard." onRetry={() => refetch()} />;
  }

  const counts: Record<string, number> = { active: 0, inactive: 0, critical: 0 };
  for (const p of data.items) {
    if (p.status in counts) {
      counts[p.status] += 1;
    }
  }
  const max = Math.max(1, ...Object.values(counts));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          to="/patients/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New patient
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total patients</p>
          <p className="text-3xl font-bold">{data.total}</p>
        </div>
        {STATUS_ORDER.map((s) => (
          <Link
            key={s}
            to="/patients"
            className="rounded bg-white p-4 shadow-sm hover:shadow"
          >
            <p className="text-sm capitalize text-slate-500">{s}</p>
            <p className="text-3xl font-bold">{counts[s]}</p>
          </Link>
        ))}
      </div>

      <div className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Patients by status</h2>
        <div className="flex flex-col gap-3">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-20 text-sm capitalize text-slate-600">{s}</span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-slate-200">
                <div
                  className={`h-full rounded ${BAR_COLORS[s]}`}
                  style={{ width: `${(counts[s] / max) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm font-medium">{counts[s]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
