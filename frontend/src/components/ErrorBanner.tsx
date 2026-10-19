interface Props {
  message: string;
  onRetry?: () => void;
}

/* Visible banner for failed loads, with an optional retry action. */
export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
