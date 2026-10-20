import { Link } from 'react-router-dom';
import { usePatientStats } from '../api/hooks';
import ErrorBanner from '../components/ErrorBanner';
import StatusPieChart from '../components/StatusPieChart';

const STATUS_ORDER = ['active', 'inactive', 'critical'] as const;
/* Slice colors follow the calming clinical palette: dusty teal for active,
   warm gray for inactive, softened clay for critical (urgent without the
   overstimulation of alarm red). */
const SLICE_COLORS: Record<(typeof STATUS_ORDER)[number], string> = {
  active: '#2F7E8F',
  inactive: '#9AA3A8',
  critical: '#C26D5B',
};

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path d="M7 2v10M2 7h10" />
    </svg>
  );
}

/* Home page: key counts up top, then an interactive donut chart of patients
   by status. Clicking a slice (or a stat card) opens the patient list
   filtered to that status. */
export default function Dashboard() {
  const { data, isLoading, isError, refetch } = usePatientStats();

  if (isLoading) {
    return <p className="text-ink-500">Loading overview…</p>;
  }
  if (isError || !data) {
    return <ErrorBanner message="Could not load the dashboard." onRetry={() => refetch()} />;
  }

  const counts: Record<string, number> = {
    active: data.by_status.active ?? 0,
    inactive: data.by_status.inactive ?? 0,
    critical: data.by_status.critical ?? 0,
  };
  const slices = STATUS_ORDER.map((s) => ({
    status: s,
    count: counts[s],
    color: SLICE_COLORS[s],
  }));

  return (
    <div className="page-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            An overview of your patient population. Select a slice or status to filter the list.
          </p>
        </div>
        <Link to="/patients/new" className="btn-primary">
          <PlusIcon />
          New patient
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link to="/patients" className="stat-card">
          <p className="text-sm text-ink-500">Total patients</p>
          <p className="mt-1 text-3xl font-bold text-ink-900">{data.total}</p>
        </Link>
        {STATUS_ORDER.map((s) => (
          <Link key={s} to={`/patients?status=${s}`} className="stat-card">
            <p className="flex items-center gap-2 text-sm capitalize text-ink-500">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SLICE_COLORS[s] }}
              />
              {s}
            </p>
            <p className="mt-1 text-3xl font-bold text-ink-900">{counts[s]}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-mist-200">
        <h2 className="mb-1 font-semibold text-ink-900">Patients by status</h2>
        <p className="mb-6 text-sm text-ink-500">
          Hover a slice for detail, click it to filter the patient list.
        </p>
        <StatusPieChart slices={slices} total={data.total} />
      </div>
    </div>
  );
}
