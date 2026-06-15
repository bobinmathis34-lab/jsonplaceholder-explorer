export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string; bs: string };
  address: { city: string; street: string; suite: string; zipcode: string };
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

export interface UserWithPosts extends User {
  posts: Post[];
}

export interface PostEnriched extends Post {
  author: Pick<User, "id" | "name" | "username" | "email"> | null;
  comments: Comment[];
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
