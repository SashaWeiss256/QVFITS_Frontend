/* Http Client */
import { apiTimeout, apiUrl } from "./config";
import { apiErrorFromBody, networkError } from "./error";
import { accessToken, clearAccessToken } from "./tokens";
import type { Envelope, ErrorBody, Page, Realm } from "./types";

export interface HttpOptions {
  params?: Record<string, unknown>;
  realm?: Realm;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface RequestInit_ extends HttpOptions {
  body?: unknown;
}

/**
 * Every call names its realm, so an admin token never rides along on a
 * customer request.
 */
async function request<T>(method: string, path: string, options: RequestInit_ = {}): Promise<Envelope<T>> {
  const { body, params, realm = "customer", headers, signal } = options;
  const control = abortAfter(apiTimeout, signal);
  let response: Response;

  try {
    response = await fetch(apiUrl(path, params), {
      method,
      signal: control.signal,
      credentials: "include",
      headers: buildHeaders({ body, headers, realm }),
      body: serialize(body),
    });
  } catch (cause) {
    throw networkError(cause);
  } finally {
    control.done();
  }

  // A rejected token is dropped; the auth context hears it and signs out.
  if (response.status === 401 && accessToken(realm)) clearAccessToken(realm);

  return unwrap<T>(response);
}

function buildHeaders({ body, headers, realm }: { body: unknown; headers?: Record<string, string>; realm: Realm }) {
  const token = accessToken(realm);
  return {
    Accept: "application/json",
    // FormData sets its own multipart boundary; naming a type here breaks it.
    ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

function serialize(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  return body instanceof FormData ? body : JSON.stringify(body);
}

/** The API answers `{ data, meta? }` on success and `{ error }` on failure. */
async function unwrap<T>(response: Response): Promise<Envelope<T>> {
  if (response.status === 204) return { data: null as T, meta: null };

  const body = await response.json().catch(() => null);
  if (!response.ok) throw apiErrorFromBody(response.status, body as ErrorBody | null);

  if (body && typeof body === "object" && "data" in body) {
    return { data: body.data as T, meta: body.meta ?? null };
  }
  return { data: body as T, meta: null };
}

function abortAfter(ms: number, signal?: AbortSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

export const http = {
  get: async <T>(path: string, options?: HttpOptions) => (await request<T>("GET", path, options)).data,
  post: async <T>(path: string, body?: unknown, options?: HttpOptions) =>
    (await request<T>("POST", path, { ...options, body })).data,
  patch: async <T>(path: string, body?: unknown, options?: HttpOptions) =>
    (await request<T>("PATCH", path, { ...options, body })).data,
  put: async <T>(path: string, body?: unknown, options?: HttpOptions) =>
    (await request<T>("PUT", path, { ...options, body })).data,
  del: async <T = null>(path: string, options?: HttpOptions) => (await request<T>("DELETE", path, options)).data,

  /** A paged collection: `{ items, meta }` rather than a bare array. */
  list: async <T>(path: string, options?: HttpOptions): Promise<Page<T>> => {
    const { data, meta } = await request<T[]>("GET", path, options);
    return { items: data ?? [], meta };
  },
};
