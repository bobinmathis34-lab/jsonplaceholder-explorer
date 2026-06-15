import { fetchUpstream } from "../upstream.js";
import { ApiError } from "../middleware/errorHandler.js";
import type { Post, Comment, User, PostEnriched, Paginated } from "../types.js";

interface ListPostsParams {
  page: number;
  pageSize: number;
  userId?: number;
  q?: string; // free-text filter on title
}

/**
 * Lists posts with pagination + optional filtering.
 *
 * JSONPlaceholder has no real pagination, so we fetch the full collection
 * (cheap, fully cached) and paginate/filter in memory. This keeps the public
 * contract clean and would map 1:1 onto a DB `LIMIT/OFFSET` if the data source
 * changed.
 */
export async function listPosts(params: ListPostsParams): Promise<Paginated<Post>> {
  const { page, pageSize, userId, q } = params;

  let posts = await fetchUpstream<Post[]>("/posts");

  if (userId !== undefined) {
    posts = posts.filter((p) => p.userId === userId);
  }
  if (q) {
    const needle = q.toLowerCase();
    posts = posts.filter((p) => p.title.toLowerCase().includes(needle));
  }

  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const data = posts.slice(start, start + pageSize);

  return { data, pagination: { page, pageSize, total, totalPages } };
}

export async function getPostById(id: number): Promise<PostEnriched> {
  const post = await fetchUpstream<Post>(`/posts/${id}`);
  if (!post || typeof post.id !== "number") {
    throw new ApiError(404, `Post ${id} not found`, "POST_NOT_FOUND");
  }

  // Fetch author and comments in parallel — they don't depend on each other.
  const [author, comments] = await Promise.all([
    fetchUpstream<User>(`/users/${post.userId}`).catch(() => null),
    fetchUpstream<Comment[]>(`/comments?postId=${id}`),
  ]);

  return {
    ...post,
    author: author && typeof author.id === "number"
      ? { id: author.id, name: author.name, username: author.username, email: author.email }
      : null,
    comments,
  };
}
