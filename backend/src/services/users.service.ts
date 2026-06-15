import { fetchUpstream } from "../upstream.js";
import { ApiError } from "../middleware/errorHandler.js";
import type { User, Post, UserWithPosts } from "../types.js";

export async function getAllUsers(): Promise<User[]> {
  return fetchUpstream<User[]>("/users");
}

export async function getUserById(id: number): Promise<UserWithPosts> {
  // JSONPlaceholder returns {} (not 404) for unknown ids, so we validate
  // the shape ourselves and surface a clean 404.
  const user = await fetchUpstream<User>(`/users/${id}`);
  if (!user || typeof user.id !== "number") {
    throw new ApiError(404, `User ${id} not found`, "USER_NOT_FOUND");
  }
  const posts = await fetchUpstream<Post[]>(`/posts?userId=${id}`);
  return { ...user, posts };
}
