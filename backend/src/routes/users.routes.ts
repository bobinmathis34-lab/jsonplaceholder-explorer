import { Router } from "express";
import { getAllUsers, getUserById } from "../services/users.service.js";
import { ApiError } from "../middleware/errorHandler.js";

export const usersRouter = Router();

/** Parse and validate an :id path param into a positive integer. */
function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `Invalid id: "${raw}"`, "INVALID_ID");
  }
  return id;
}

// GET /users — list all users
usersRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await getAllUsers());
  } catch (err) {
    next(err);
  }
});

// GET /users/:id — single user with their posts
usersRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    res.json(await getUserById(id));
  } catch (err) {
    next(err);
  }
});
