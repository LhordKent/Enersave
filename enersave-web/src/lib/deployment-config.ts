function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

export function normalizeBaseUrl(value: string) {
  return trimTrailingSlashes(value.trim());
}

export function buildAnalyticsUrl(baseUrl: string) {
  return `${normalizeBaseUrl(baseUrl)}/api/analytics/clusters`;
}

export function getAnalyticsServiceUrl() {
  const configuredBaseUrl = process.env.AI_BASE_URL ?? process.env.NEXT_PUBLIC_AI_BASE_URL ?? "http://127.0.0.1:8000";
  return buildAnalyticsUrl(configuredBaseUrl);
}

export function getKvConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url: normalizeBaseUrl(url), token };
}
