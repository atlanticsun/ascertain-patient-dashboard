const PALETTE = [
  'bg-teal-100 text-teal-700',
  'bg-sage-100 text-sage-600',
  'bg-clay-100 text-clay-600',
  'bg-sand text-ink-700',
  'bg-mist-200 text-ink-700',
];

/* Initials avatar with a deterministic color per name, so each patient is
   visually distinct across page turns. */
export default function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const hash = [...`${firstName}${lastName}`].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${PALETTE[hash % PALETTE.length]}`}
    >
      {initials}
    </span>
  );
}
