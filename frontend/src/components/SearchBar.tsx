interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search…" }: Props) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-gray-700 dark:bg-gray-900"
      />
    </div>
  );
}
