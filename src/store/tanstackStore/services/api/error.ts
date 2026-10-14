/* Api Error */
import type { ErrorBody, ErrorDetails } from "./types";

/**
 * Mirrors the backend's AppError. Every failed response arrives as
 * `{ error: { code, message, details?, requestId } }` from one error
 * middleware, so the client has exactly one shape to read and `code` is
 * reliable enough to branch on — unlike a message, which is translated.
 */

const CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE",
  429: "RATE_LIMITED",
};

const MESSAGES: Record<number, string> = {
  401: "Please sign in to continue.",
  403: "You do not have access to that.",
  404: "We could not find that.",
  429: "Too many attempts. Try again shortly.",
};

interface ApiErrorOptions {
  code?: string;
  details?: ErrorDetails;
  requestId?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: ErrorDetails;
  requestId?: string;

  constructor(message: string, status = 400, { code, details, requestId }: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code ?? codeFor(status);
    this.details = details;
    this.requestId = requestId;
  }

  /** Field errors from the zod validate middleware, keyed by field name. */
  get fieldErrors() {
    return this.details?.fieldErrors ?? null;
  }
}

export function codeFor(status: number) {
  return CODES[status] ?? "INTERNAL_ERROR";
}

export function apiErrorFromBody(status: number, body: ErrorBody | null) {
  const error = body?.error ?? {};
  return new ApiError(error.message || messageFor(status), status, error);
}

/** The request never reached the server: offline, DNS, CORS, or a timeout. */
export function networkError(cause: unknown) {
  const aborted = cause instanceof Error && cause.name === "AbortError";
  return new ApiError(
    aborted ? "That took too long. Try again." : "Cannot reach the server.",
    0,
    { code: aborted ? "TIMEOUT" : "NETWORK_ERROR" },
  );
}

/** True for the failures worth retrying or reporting: the server's, not the caller's. */
export function isServerError(error: unknown) {
  return error instanceof ApiError ? error.status === 0 || error.status >= 500 : true;
}

function messageFor(status: number) {
  return MESSAGES[status] ?? "Something went wrong.";
}
