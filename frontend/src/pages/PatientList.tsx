import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePatients } from '../api/hooks';
import StatusBadge from '../components/StatusBadge';
import ErrorBanner from '../components/ErrorBanner';
import Pagination from '../components/Pagination';
import EditButton from '../components/EditButton';
import Avatar from '../components/Avatar';
import Highlight from '../components/Highlight';

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
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* Human friendly relative dates for the last visit column. The exact date
   stays available on hover via the title attribute. */
function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'last_visit', label: 'Last visit' },
  { key: 'status', label: 'Status' },
  { key: 'blood_type', label: 'Blood type' },
] as const;

const COL_WIDTHS = ['w-[26%]', 'w-[10%]', 'w-[16%]', 'w-[16%]', 'w-[14%]', 'w-[18%]'];

/* Pulsing placeholder rows shown on first load, mirroring the real table's
   shape so the layout never jumps when data arrives. */
function SkeletonTable() {
  return (
    <div
      className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-mist-200"
      aria-label="Loading patients"
    >
      <table className="w-full min-w-[640px] table-fixed text-left text-sm">
        <colgroup>
          {COL_WIDTHS.map((w) => (
            <col key={w} className={w} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-mist-200 bg-mist-50 text-ink-500">
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-4 py-2 font-semibold">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, r) => (
            <tr key={r} className="border-b border-mist-100 last:border-0">
              {COL_WIDTHS.map((_, c) => (
                <td key={c} className="px-4 py-2">
                  {c === 0 ? (
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-mist-200" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-mist-200" />
                    </div>
                  ) : c === 5 ? (
                    <div className="ml-auto h-8 w-16 animate-pulse rounded-lg bg-mist-200" />
                  ) : (
                    <div
                      className="h-4 animate-pulse rounded bg-mist-200"
                      style={{ width: `${[70, 40, 55, 45][c - 1]}%` }}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PatientList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  // The dashboard pie chart links here with ?status=, so the list opens
  // pre filtered to the slice that was clicked.
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') ?? '');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // The dashboard pie links here with ?status=. Keep the filter and the URL
  // in sync both ways so the back button and re clicking a slice behave.
  useEffect(() => {
    const fromUrl = searchParams.get('status') ?? '';
    setStatusFilter((prev) => (prev === fromUrl ? prev : fromUrl));
  }, [searchParams]);

  const debouncedSearch = useDebouncedValue(search, 300);

  // New searches, filters, and sorts start back at page one.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortBy, sortDir]);

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
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  }

  return (
    <div className="page-in">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Patients</h1>
        <Link to="/patients/new" className="btn-primary">
          + New patient
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="flex-1 rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            const v = e.target.value;
            setStatusFilter(v);
            setSearchParams(v ? { status: v } : {}, { replace: true });
          }}
          className="rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {isError && <ErrorBanner message="Could not load patients." onRetry={() => refetch()} />}

      {isLoading ? (
        <SkeletonTable />
      ) : (
        data && (
          <>
            {isFetching && <p className="mb-2 text-xs text-ink-500/70">Updating…</p>}
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-mist-200">
              <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                <colgroup>
                  {COL_WIDTHS.map((w) => (
                    <col key={w} className={w} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b border-mist-200 bg-mist-50 text-ink-500">
                    {COLUMNS.map((col) => (
                      <th key={col.key} className="px-4 py-2">
                        <button
                          onClick={() => toggleSort(col.key)}
                          className="font-semibold transition-colors hover:text-teal-700"
                        >
                          {col.label} {sortBy === col.key && (sortDir === 'asc' ? '▲' : '▼')}
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-mist-100 transition-colors last:border-0 hover:bg-teal-50/50"
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar firstName={p.first_name} lastName={p.last_name} />
                          <Link
                            to={`/patients/${p.id}`}
                            className="min-w-0 flex-1 truncate font-medium text-teal-700 hover:underline"
                          >
                            <Highlight
                              text={`${p.first_name} ${p.last_name}`}
                              query={debouncedSearch}
                            />
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-2">{p.age}</td>
                      <td className="px-4 py-2">
                        <div className="leading-tight">{formatDate(p.updated_at)}</div>
                        <div className="text-xs text-ink-500/70">{timeAgo(p.updated_at)}</div>
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-2">{p.blood_type || '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <EditButton to={`/patients/${p.id}/edit`} />
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                        No patients match this search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )
      )}
    </div>
  );
}
