const STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-slate-200 text-slate-700",
  critical: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-slate-200 text-slate-700";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {status}
    </span>
  );
}
