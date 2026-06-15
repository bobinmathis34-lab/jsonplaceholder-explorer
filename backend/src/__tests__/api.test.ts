import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import request from "supertest";
import { TtlCache } from "../cache.js";
import { createApp } from "../app.js";
import { cache } from "../upstream.js";

// ---- Cache unit tests -------------------------------------------------------

describe("TtlCache", () => {
  it("returns undefined for a missing key (miss)", () => {
    const c = new TtlCache(1000);
    expect(c.get("nope")).toBeUndefined();
    expect(c.stats().misses).toBe(1);
  });

  it("stores and retrieves a value (hit)", () => {
    const c = new TtlCache(1000);
    c.set("k", 42);
    expect(c.get<number>("k")).toBe(42);
    expect(c.stats().hits).toBe(1);
  });

  it("expires entries after the TTL", () => {
    vi.useFakeTimers();
    const c = new TtlCache(1000);
    c.set("k", "v");
    vi.advanceTimersByTime(1001);
    expect(c.get("k")).toBeUndefined();
    vi.useRealTimers();
  });

  it("getOrSet only calls the producer on a miss", async () => {
    const c = new TtlCache(1000);
    const producer = vi.fn().mockResolvedValue("computed");
    expect(await c.getOrSet("k", producer)).toBe("computed");
    expect(await c.getOrSet("k", producer)).toBe("computed");
    expect(producer).toHaveBeenCalledTimes(1);
  });
});

// ---- API integration tests (upstream mocked via global fetch) ---------------

const USERS = [{ id: 1, name: "Leanne", username: "Bret", email: "a@b.c" }];
const POSTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  userId: (i % 2) + 1,
  title: `Title ${i + 1}`,
  body: "body",
}));

function mockFetch(url: string) {
  const path = url.replace("https://jsonplaceholder.typicode.com", "");
  let body: unknown = [];
  if (path === "/users") body = USERS;
  else if (path.startsWith("/posts?userId=")) {
    const uid = Number(path.split("=")[1]);
    body = POSTS.filter((p) => p.userId === uid);
  } else if (path === "/posts") body = POSTS;
  else if (path.startsWith("/posts/")) body = POSTS[0];
  else if (path.startsWith("/users/")) body = USERS[0];
  else if (path.startsWith("/comments")) body = [{ id: 1, postId: 1, name: "c", email: "x", body: "hi" }];
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response);
}

describe("API endpoints", () => {
  const app = createApp();

  beforeEach(() => {
    cache.clear();
    vi.stubGlobal("fetch", vi.fn((url: string) => mockFetch(url)));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("GET /users returns the user list", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("GET /posts paginates (pageSize=5 → 5 items, total 12)", async () => {
    const res = await request(app).get("/posts?page=1&pageSize=5");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.pagination.total).toBe(12);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it("GET /posts?userId=1 filters by author", async () => {
    const res = await request(app).get("/posts?userId=1&pageSize=100");
    expect(res.body.data.every((p: { userId: number }) => p.userId === 1)).toBe(true);
  });

  it("GET /posts/:id enriches with author and comments", async () => {
    const res = await request(app).get("/posts/1");
    expect(res.body.author).not.toBeNull();
    expect(res.body.comments).toHaveLength(1);
  });

  it("rejects an invalid id with 400", async () => {
    const res = await request(app).get("/posts/abc");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ID");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
  });
});
