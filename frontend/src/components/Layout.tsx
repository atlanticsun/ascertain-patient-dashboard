import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/patients", label: "Patients", end: false },
];

function linkClass(active: boolean) {
  return `block rounded px-3 py-2 text-sm font-medium ${
    active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-200"
  }`;
}

/* App shell: header with nav, collapsible sidebar, main content area.
   On small screens the sidebar becomes a slide over drawer. */
export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <button
          className="rounded p-2 text-slate-600 hover:bg-slate-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 4h16v2H2zM2 9h16v2H2zM2 14h16v2H2z" />
          </svg>
        </button>
        <Link to="/" className="text-lg font-bold text-blue-700">
          Patient Dashboard
        </Link>
        <nav className="ml-6 hidden gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => linkClass(isActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white p-4 shadow-md transition-transform md:static md:z-auto md:translate-x-0 md:shadow-none ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-2 flex items-center justify-between md:hidden">
            <span className="font-semibold">Menu</span>
            <button
              className="rounded p-2 hover:bg-slate-200"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => linkClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/patients/new"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              + New patient
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
