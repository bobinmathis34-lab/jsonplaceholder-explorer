interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm transition enabled:hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:enabled:hover:bg-gray-800"
      >
        ← Prev
      </button>
      <span className="px-3 text-sm text-gray-600 dark:text-gray-400">
        Page {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm transition enabled:hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:enabled:hover:bg-gray-800"
      >
        Next →
      </button>
    </div>
  );
}
