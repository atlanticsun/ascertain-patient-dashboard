import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

function DashboardIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" />
      <rect x="9.5" y="2" width="5.5" height="5.5" rx="1.2" />
      <rect x="2" y="9.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.2" />
    </svg>
  );
}

function PatientsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.8 14c.6-2.6 2.3-4 4.2-4s3.6 1.4 4.2 4" />
      <circle cx="11.8" cy="6" r="2" />
      <path d="M11.5 10.2c1.6.2 2.9 1.5 3.4 3.6" />
    </svg>
  );
}

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
      aria-hidden="true"
    >
      <path d="M7 2v10M2 7h10" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.5 2.5h3v3" />
      <path d="M12.5 2.5L7 8" />
      <path d="M12.5 9v3.5h-10v-10H6" />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#2F7E8F" />
      <path d="M12 4v16.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M 15.12 4.35 L 15.32 4.21 L 15.35 4.19 L 15.03 4.30 L 14.48 4.45 L 13.78 4.60 L 12.98 4.77 L 12.11 4.93 L 11.22 5.10 L 10.35 5.26 L 9.54 5.43 L 8.81 5.61 L 8.17 5.80 L 7.59 6.05 L 6.96 6.54 L 6.71 7.96 L 7.36 8.76 L 7.93 9.04 L 8.53 9.22 L 9.21 9.38 L 9.97 9.54 L 10.78 9.68 L 11.62 9.83 L 12.46 9.98 L 13.24 10.12 L 13.94 10.26 L 14.51 10.39 L 14.91 10.50 L 15.05 10.55 L 14.81 10.26 L 14.83 9.30 L 15.06 9.05 L 14.91 9.12 L 14.52 9.26 L 13.97 9.41 L 13.30 9.57 L 12.55 9.73 L 11.76 9.90 L 10.97 10.06 L 10.22 10.23 L 9.52 10.40 L 8.91 10.59 L 8.38 10.79 L 7.89 11.08 L 7.41 11.77 L 7.63 12.81 L 8.13 13.22 L 8.62 13.43 L 9.18 13.60 L 9.81 13.75 L 10.51 13.91 L 11.25 14.05 L 11.99 14.20 L 12.72 14.34 L 13.38 14.48 L 13.96 14.62 L 14.41 14.75 L 14.68 14.85 L 14.70 14.84 L 14.54 14.42 L 14.70 13.96 L 14.71 13.95 L 14.46 14.07 L 14.04 14.21 L 13.50 14.37 L 12.88 14.53 L 12.20 14.70 L 11.50 14.86 L 10.82 15.03 L 10.18 15.20 L 9.61 15.37 L 9.11 15.56 L 8.69 15.78 L 8.30 16.12 L 8.13 16.82 L 8.45 17.38 L 8.84 17.63 L 9.28 17.81 L 9.79 17.97 L 10.37 18.13 L 10.99 18.28 L 11.64 18.42 L 12.29 18.57 L 12.90 18.71 L 13.45 18.85 L 13.91 18.99 L 14.25 19.11 L 14.43 19.20 L 14.41 19.15 L 14.40 18.87 L 14.38 18.87 L 15.25 19.53 L 15.46 19.22 L 15.43 18.63 L 15.12 18.27 L 14.75 18.04 L 14.31 17.86 L 13.80 17.68 L 13.22 17.51 L 12.59 17.34 L 11.94 17.18 L 11.30 17.01 L 10.71 16.85 L 10.18 16.69 L 9.76 16.54 L 9.48 16.41 L 9.41 16.36 L 9.53 16.60 L 9.45 16.99 L 9.45 17.02 L 9.67 16.93 L 10.06 16.80 L 10.57 16.67 L 11.18 16.53 L 11.85 16.38 L 12.55 16.24 L 13.24 16.09 L 13.90 15.94 L 14.51 15.79 L 15.04 15.62 L 15.51 15.43 L 15.95 15.11 L 16.26 14.34 L 15.92 13.60 L 15.48 13.28 L 15.00 13.07 L 14.45 12.89 L 13.81 12.72 L 13.11 12.55 L 12.38 12.38 L 11.64 12.21 L 10.92 12.05 L 10.27 11.89 L 9.72 11.74 L 9.31 11.59 L 9.11 11.50 L 9.22 11.59 L 9.36 12.31 L 9.13 12.70 L 9.20 12.68 L 9.53 12.57 L 10.04 12.44 L 10.68 12.30 L 11.40 12.16 L 12.18 12.02 L 12.98 11.87 L 13.75 11.72 L 14.48 11.57 L 15.14 11.41 L 15.72 11.23 L 16.24 11.00 L 16.82 10.44 L 16.85 9.16 L 16.27 8.56 L 15.74 8.30 L 15.15 8.10 L 14.48 7.92 L 13.73 7.75 L 12.91 7.58 L 12.07 7.41 L 11.25 7.25 L 10.47 7.09 L 9.78 6.93 L 9.23 6.78 L 8.86 6.65 L 8.80 6.62 L 9.16 7.11 L 8.98 8.21 L 8.79 8.40 L 9.00 8.33 L 9.46 8.21 L 10.10 8.08 L 10.86 7.94 L 11.70 7.79 L 12.59 7.65 L 13.48 7.50 L 14.33 7.35 L 15.11 7.20 L 15.81 7.03 L 16.43 6.84 L 17.06 6.50 L 17.48 6.05 Z"
        fill="#fff"
      />
      <ellipse
        cx="16.30"
        cy="5.20"
        rx="2.0"
        ry="1.6"
        fill="#fff"
        transform={`rotate(-22.5 16.30 5.20)`}
      />
      <circle cx="17.22" cy="4.27" r="0.5" fill="#2F7E8F" />
    </svg>
  );
}

const NAV = [
  { to: '/', label: 'Dashboard', end: true, Icon: DashboardIcon },
  { to: '/patients', label: 'Patients', end: false, Icon: PatientsIcon },
];

const DOCS_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/docs`;

function DocsLink() {
  return (
    <a href={DOCS_URL} target="_blank" rel="noreferrer" className="nav-link">
      <DocsIcon />
      API Docs
    </a>
  );
}

function linkClass(active: boolean) {
  return `nav-link ${active ? 'nav-link-active' : ''}`;
}

/* App shell: header with nav, collapsible sidebar, main content area.
   On small screens the sidebar becomes a slide over drawer. */
export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mist-50 font-sans text-ink-900">
      <header className="flex items-center gap-3 border-b border-mist-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <button
          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-teal-50 hover:text-teal-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 4h16v2H2zM2 9h16v2H2zM2 14h16v2H2z" />
          </svg>
        </button>
        <Link to="/" className="flex items-center gap-2.5 text-lg font-bold text-teal-700">
          <LogoIcon />
          Patient Dashboard
        </Link>
        <nav className="ml-6 hidden gap-1 md:flex">
          {NAV.map(({ to, label, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => linkClass(isActive)}>
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden md:block">
          <DocsLink />
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-mist-200 bg-white p-4 shadow-md transition-transform md:static md:z-auto md:translate-x-0 md:shadow-none ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-2 flex items-center justify-between md:hidden">
            <span className="font-semibold">Menu</span>
            <button
              className="rounded-lg p-2 transition-colors hover:bg-mist-100"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map(({ to, label, end, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => linkClass(isActive)}
              >
                <Icon />
                {label}
              </NavLink>
            ))}
            <DocsLink />
            <Link to="/patients/new" onClick={() => setOpen(false)} className="btn-primary mt-2">
              <PlusIcon />
              New patient
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
