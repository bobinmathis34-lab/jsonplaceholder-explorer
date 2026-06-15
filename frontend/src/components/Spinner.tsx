export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-gray-500 dark:text-gray-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand dark:border-gray-700 dark:border-t-brand" />
      <span>{label}</span>
    </div>
  );
}
