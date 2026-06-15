import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { PostEnriched } from "../types";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostEnriched | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getPost(Number(id))
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Spinner label="Loading post…" />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!post) return null;

  return (
    <article>
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
        ← Back to feed
      </Link>

      <h1 className="mb-4 text-3xl font-bold capitalize leading-tight">{post.title}</h1>

      {post.author && (
        <Link
          to={`/users/${post.author.id}`}
          className="mb-6 inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-brand/40 dark:border-gray-800 dark:bg-gray-900"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 font-semibold text-brand">
            {post.author.name.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-medium">{post.author.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">@{post.author.username}</p>
          </div>
        </Link>
      )}

      <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{post.body}</p>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">
          Comments <span className="text-gray-400">({post.comments.length})</span>
        </h2>
        <div className="space-y-4">
          {post.comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-medium capitalize">{c.name}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{c.email}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
