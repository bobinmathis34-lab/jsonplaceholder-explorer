import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Post, User, Paginated } from "../types";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { SearchBar } from "../components/SearchBar";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 8;

export function PostsPage() {
  const [result, setResult] = useState<Paginated<Post> | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [authorId, setAuthorId] = useState<number | "">("");

  // Load the user list once to map authorId → name and feed the filter dropdown.
  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  // Debounce the search input so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getPosts({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedQuery || undefined,
        userId: authorId === "" ? undefined : authorId,
      })
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, debouncedQuery, authorId]);

  const authorName = (id: number) => users.find((u) => u.id === id)?.name ?? `User #${id}`;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Posts feed</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {result ? `${result.pagination.total} posts` : "…"}
      </p>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} placeholder="Search posts by title…" />
        </div>
        <select
          value={authorId}
          onChange={(e) => {
            setAuthorId(e.target.value === "" ? "" : Number(e.target.value));
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All authors</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {loading && <Spinner label="Loading posts…" />}
      {error && <ErrorMessage message={error} onRetry={() => setPage((p) => p)} />}

      {!loading && !error && result && (
        <>
          <div className="space-y-4">
            {result.data.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand/10 text-[10px] font-semibold text-brand">
                    {authorName(post.userId).charAt(0)}
                  </span>
                  {authorName(post.userId)}
                </div>
                <h2 className="font-semibold capitalize leading-snug group-hover:text-brand">{post.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{post.body}</p>
              </Link>
            ))}
          </div>

          {result.data.length === 0 && (
            <p className="py-12 text-center text-gray-500 dark:text-gray-400">No posts match your filters.</p>
          )}

          <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
