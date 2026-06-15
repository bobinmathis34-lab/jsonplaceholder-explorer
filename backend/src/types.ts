/** Domain types mirroring the JSONPlaceholder schema (trimmed to what we use). */

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string; bs: string };
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: { lat: string; lng: string };
  };
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

/** A user enriched with the posts they authored. */
export interface UserWithPosts extends User {
  posts: Post[];
}

/** A post enriched with its author and comments. */
export interface PostEnriched extends Post {
  author: Pick<User, "id" | "name" | "username" | "email"> | null;
  comments: Comment[];
}

/** Generic paginated envelope returned by list endpoints. */
export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
