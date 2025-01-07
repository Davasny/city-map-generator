import {
  ConfiguredMiddleware,
  FetchLike,
  WretchOptions,
  WretchResponse,
} from "wretch";

import { LRUCache } from "lru-cache";

const getCacheKey = (url: string, opts: WretchOptions): string => {
  const optsString = opts ? JSON.stringify(opts, Object.keys(opts).sort()) : "";
  return `${url}:${optsString}`;
};

interface CachedResponse {
  body: ArrayBuffer;
  headers: Response["headers"];
  status: Response["status"];
  statusText: Response["statusText"];
}

export const WretchLruMiddleware = (
  lruOptions: LRUCache.Options<string, CachedResponse, unknown> = {
    ttl: 1000 * 60 * 60, // 1h
    max: 1000,
  },
): ConfiguredMiddleware => {
  const cache = new LRUCache<string, CachedResponse>(lruOptions);

  const middleware = (next: FetchLike): FetchLike => {
    const checkCache = async (
      url: string,
      opts: WretchOptions,
    ): Promise<WretchResponse> => {
      const cacheKey = getCacheKey(url, opts);

      const cachedResponse = cache.get(cacheKey);
      if (cachedResponse) {
        console.log(`Cache hit for ${url}`);

        return new Response(cachedResponse.body, {
          headers: cachedResponse.headers,
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
        }) as WretchResponse;
      }

      return next(url, opts).then(async (response) => {
        console.log(`Cache miss for ${url}`);
        const newResponse = {
          body: await response.arrayBuffer(),
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        };

        cache.set(cacheKey, newResponse);

        return new Response(newResponse.body, {
          headers: newResponse.headers,
          status: newResponse.status,
          statusText: newResponse.statusText,
        }) as WretchResponse;
      });
    };

    return checkCache;
  };

  return middleware;
};
