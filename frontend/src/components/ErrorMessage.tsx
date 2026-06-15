export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="my-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/40">
      <p className="font-medium text-red-700 dark:text-red-300">Something went wrong</p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
