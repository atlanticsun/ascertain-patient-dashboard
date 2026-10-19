import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="mb-2 mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mb-6 text-sm text-slate-500">
        This page does not exist or was moved.
      </p>
      <Link
        to="/"
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
