interface Props {
  message: string;
  onRetry?: () => void;
}

/* Visible banner for failed loads, with an optional retry action. */
export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded border border-clay-500/30 bg-clay-100 px-4 py-3 text-sm text-clay-600">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary shrink-0 !bg-clay-500 px-3 py-1.5 hover:!bg-clay-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}
