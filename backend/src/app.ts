import express from "express";
import cors from "cors";
import { usersRouter } from "./routes/users.routes.js";
import { postsRouter } from "./routes/posts.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { cache } from "./upstream.js";

/** Builds the Express app. Kept separate from `index.ts` so tests can import it
 *  without binding a port. */
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check + cache stats.
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", cache: cache.stats() });
  });

  app.use("/users", usersRouter);
  app.use("/posts", postsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
