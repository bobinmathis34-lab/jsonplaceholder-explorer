import type { User, UserWithPosts, Post, PostEnriched, Paginated } from "../types";

// In dev, "/api" is proxied to the backend by Vite (see vite.config.ts).
// In prod, set VITE_API_URL to the deployed backend origin.
const BASE = import.meta.env.VITE_API_URL ?? "/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      /* non-JSON error body; keep default message */
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getUsers: () => get<User[]>("/users"),
  getUser: (id: number) => get<UserWithPosts>(`/users/${id}`),
  getPosts: (params: { page?: number; pageSize?: number; userId?: number; q?: string }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params.userId) qs.set("userId", String(params.userId));
    if (params.q) qs.set("q", params.q);
    return get<Paginated<Post>>(`/posts?${qs.toString()}`);
  },
  getPost: (id: number) => get<PostEnriched>(`/posts/${id}`),
};
