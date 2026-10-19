interface Props {
  page: number;
  pages: number;
  total: number;
  onPage: (page: number) => void;
}

export default function Pagination({ page, pages, total, onPage }: Props) {
  if (pages <= 1) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        {total} {total === 1 ? "patient" : "patients"}
      </p>
    );
  }
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Page {page} of {pages} ({total} {total === 1 ? "patient" : "patients"})
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-200"
        >
          Previous
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}
