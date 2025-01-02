import {
  ConfiguredMiddleware,
  FetchLike,
  WretchOptions,
  WretchResponse,
} from "wretch";
import { LRUCache } from "lru-cache";

// Node.js built-in crypto (or alternative in the browser)
import { createHash } from "crypto";

interface CachedResponseData {
  body: ArrayBuffer;
  headers: Record<string, string>;
  status: number;
  statusText: string;
}

/**
 * Create a brand-new Response from cached data.
 */
function buildFreshResponse(data: CachedResponseData) {
  return new Response(data.body, {
    status: data.status,
    statusText: data.statusText,
    headers: data.headers,
  });
}

/**
 * Create a stable key by hashing the URL + stringified request body.
 */
function createCacheKey(url: string, body?: unknown): string {
  // Convert the request body to a string
  let bodyString = "";

  // If body is an object, we can do JSON stringification
  if (typeof body === "object" && body !== null) {
    bodyString = JSON.stringify(body);
  } else if (typeof body === "string") {
    bodyString = body;
  }
  // ... handle other body types as needed

  return createHash("md5")
    .update(url + bodyString)
    .digest("hex");
}

export const WretchLruMiddleware = (
  lruOptions: LRUCache.Options<string, CachedResponseData, unknown>,
): ConfiguredMiddleware => {
  const cache = new LRUCache<string, CachedResponseData>(lruOptions);

  const middleware = (next: FetchLike): FetchLike => {
    return async (
      url: string,
      opts: WretchOptions,
    ): Promise<WretchResponse> => {
      // Create a unique key from URL + request body
      const cacheKey = createCacheKey(url, opts.body);

      // Check if we already have a cached response
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log("Cache hit", url);
        return buildFreshResponse(cached);
      }

      // Otherwise fetch from network
      console.log("Cache miss", url);
      const response = await next(url, opts);

      // Decide if you want to cache this response
      if (response.ok) {
        const clone = response.clone();
        // Buffer the body
        const body = await clone.arrayBuffer();

        // Convert headers into a plain object
        const headers: Record<string, string> = {};
        clone.headers.forEach((value, key) => {
          headers[key] = value;
        });

        // Store in the cache
        cache.set(cacheKey, {
          body,
          headers,
          status: clone.status,
          statusText: clone.statusText,
        });
      }

      return response;
    };
  };

  return middleware;
};
