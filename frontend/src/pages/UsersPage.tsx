import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { User } from "../types";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { SearchBar } from "../components/SearchBar";
import { Mail, Building2, MapPin } from "lucide-react";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
    );
  }, [users, query]);

  if (loading) return <Spinner label="Loading users…" />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Authors</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{users.length} authors</p>

      <div className="mb-6 max-w-md">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name or username…" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <Link
            key={u.id}
            to={`/users/${u.id}`}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 font-semibold text-brand">
                {u.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold group-hover:text-brand">{u.name}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">@{u.username}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2 truncate">
                <Mail size={14} className="shrink-0 text-gray-400" />
                <span className="truncate">{u.email}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Building2 size={14} className="shrink-0 text-gray-400" />
                <span className="truncate">{u.company.name}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <MapPin size={14} className="shrink-0 text-gray-400" />
                <span className="truncate">{u.address.city}</span>
              </div>
            </dl>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">No authors match “{query}”.</p>
      )}
    </div>
  );
}
