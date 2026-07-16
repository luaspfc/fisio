/**
 * Shared fetch helpers for the Scholar Finder source adapters.
 * Every public API we call is free/unauthenticated and has no official SLA,
 * so every request gets a hard timeout and never throws past the adapter —
 * callers get `null` on any failure and log the reason.
 */

const DEFAULT_TIMEOUT_MS = 8000;

const CONTACT_EMAIL = process.env.SCHOLAR_CONTACT_EMAIL || "";
export const SCHOLAR_USER_AGENT = CONTACT_EMAIL
  ? `ScholarFinderAI/1.0 (mailto:${CONTACT_EMAIL})`
  : "ScholarFinderAI/1.0 (+https://github.com/luaspfc/fisio)";

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": SCHOLAR_USER_AGENT,
        Accept: "application/json",
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  timeoutMs?: number
): Promise<T | null> {
  try {
    const response = await fetchWithTimeout(url, init, timeoutMs);
    if (!response.ok) {
      console.warn(`[scholar] ${url} -> HTTP ${response.status}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[scholar] fetch failed for ${url}:`, (error as Error).message);
    return null;
  }
}

export async function fetchText(
  url: string,
  init?: RequestInit,
  timeoutMs?: number
): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(url, init, timeoutMs);
    if (!response.ok) {
      console.warn(`[scholar] ${url} -> HTTP ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.warn(`[scholar] fetch failed for ${url}:`, (error as Error).message);
    return null;
  }
}

/** Strips JATS/HTML-ish tags CrossRef sometimes embeds in abstracts. */
export function stripTags(input: string | null | undefined): string | null {
  if (!input) return null;
  const text = input
    .replace(/<jats:[^>]*>/gi, "")
    .replace(/<\/jats:[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? text : null;
}

export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
}
