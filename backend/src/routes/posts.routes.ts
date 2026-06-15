import { Router } from "express";
import { listPosts, getPostById } from "../services/posts.service.js";
import { ApiError } from "../middleware/errorHandler.js";

export const postsRouter = Router();

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `Invalid id: "${raw}"`, "INVALID_ID");
  }
  return id;
}

/** Parse a positive-integer query param with a fallback default. */
function parsePositiveInt(raw: unknown, fallback: number): number {
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

// GET /posts — paginated list, filterable by userId and title (q)
postsRouter.get("/", async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = Math.min(parsePositiveInt(req.query.pageSize, 10), 100);
    const userId = req.query.userId !== undefined ? parseId(String(req.query.userId)) : undefined;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;

    res.json(await listPosts({ page, pageSize, userId, q }));
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id — single post with comments and author info
postsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    res.json(await getPostById(id));
  } catch (err) {
    next(err);
  }
});
