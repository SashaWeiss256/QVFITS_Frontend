/* Api Base Url And Version */

/**
 * The base URL is empty by default, making every call relative: Nginx
 * proxies /api to the API in production and Vite's dev proxy does the same
 * locally. Set VITE_API_BASE_URL only to address an API directly.
 */
const DEFAULTS: Record<string, string> = {
  VITE_API_BASE_URL: "",
  VITE_API_VERSION: "v1",
  VITE_API_TIMEOUT: "15000",
};

function read(key: string) {
  const value: unknown = import.meta.env?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : DEFAULTS[key];
}

export const apiBaseUrl = read("VITE_API_BASE_URL").replace(/\/+$/, "");
export const apiVersion = read("VITE_API_VERSION");
export const apiTimeout = Number(read("VITE_API_TIMEOUT"));

/** Everything the storefront, the account and the admin call sits under this. */
export const apiRoot = `${apiBaseUrl}/api/${apiVersion}`;

/**
 * Mocks stay on until a module is wired to the API. Services opt in one at a
 * time rather than this flag switching all of them at once.
 */
export const useMockApi = (import.meta.env?.VITE_API_MOCKS ?? "true") !== "false";

export function apiUrl(path: string, params?: Record<string, unknown>) {
  const url = `${apiRoot}/${String(path).replace(/^\/+/, "")}`;
  const query = toQuery(params);
  return query ? `${url}?${query}` : url;
}

function toQuery(params?: Record<string, unknown>) {
  if (!params) return "";
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else search.append(key, String(value));
  }

  return search.toString();
}
