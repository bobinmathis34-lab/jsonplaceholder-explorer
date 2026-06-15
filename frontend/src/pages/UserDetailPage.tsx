import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { UserWithPosts } from "../types";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { Mail, Phone, Building2, MapPin } from "lucide-react";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserWithPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getUser(Number(id))
      .then(setUser)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Spinner label="Loading author…" />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!user) return null;

  return (
    <div>
      <Link to="/users" className="mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
        ← Back to authors
      </Link>

      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand/10 text-2xl font-bold text-brand">
          {user.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5"><Mail size={14} className="text-gray-400" />{user.email}</span>
            <span className="inline-flex items-center gap-1.5"><Phone size={14} className="text-gray-400" />{user.phone}</span>
            <span className="inline-flex items-center gap-1.5"><Building2 size={14} className="text-gray-400" />{user.company.name}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" />{user.address.city}</span>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold">
        Posts <span className="text-gray-400">({user.posts.length})</span>
      </h2>
      <div className="space-y-4">
        {user.posts.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <h3 className="font-semibold capitalize leading-snug">{post.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{post.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
