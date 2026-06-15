import type { Request, Response, NextFunction } from "express";

/** Typed error carrying an HTTP status and a machine-readable code. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = "ERROR",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** 404 handler for unmatched routes. */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route not found: ${req.method} ${req.path}` },
  });
}

/** Central error handler: turns any thrown error into a consistent JSON shape. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  // Unexpected error: log server-side, return a generic 500 to the client.
  console.error("[unhandled]", err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong." } });
}
