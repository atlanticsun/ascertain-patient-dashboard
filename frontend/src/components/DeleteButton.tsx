import { useEffect, useRef, useState } from 'react';

export function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 4h11M6.5 2.5h3M4 4l.8 9.2a1 1 0 0 0 1 .8h4.4a1 1 0 0 0 1-.8L12 4" />
      <path d="M6.5 7v4M9.5 7v4" />
    </svg>
  );
}

/* Delete button with an inline two step confirm. First click arms it, second
   click fires. The armed state resets after a few seconds. */
export default function DeleteButton({
  onDelete,
  disabled,
}: {
  onDelete: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      timer.current = window.setTimeout(() => setConfirming(false), 3000);
      return;
    }
    if (timer.current) window.clearTimeout(timer.current);
    setConfirming(false);
    onDelete();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={confirming ? 'Confirm delete' : 'Delete'}
      className={confirming ? 'btn-delete-armed' : 'btn-delete'}
    >
      <TrashIcon />
      {confirming ? 'Sure?' : 'Delete'}
    </button>
  );
}
