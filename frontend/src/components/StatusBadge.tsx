const STYLES: Record<string, string> = {
  active: 'bg-teal-100 text-teal-700',
  inactive: 'bg-stone-100 text-ink-500',
  critical: 'bg-clay-100 text-clay-600',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? 'bg-stone-100 text-ink-500';
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {status}
    </span>
  );
}
