import { promises as fs } from "fs";
import * as path from "path";
import crypto from "crypto";
import {
  ConfiguredMiddleware,
  FetchLike,
  WretchOptions,
  WretchResponse,
} from "wretch";

/**
 * Calculate an MD5 checksum of the stringified URL + sorted options.
 */
const getCacheKey = (url: string, opts: WretchOptions): string => {
  const optsString = opts ? JSON.stringify(opts, Object.keys(opts).sort()) : "";
  const rawKeyString = `${url}:${optsString}`;
  return crypto.createHash("md5").update(rawKeyString).digest("hex");
};

/**
 * The structure of our cached response.
 */
interface CachedResponse {
  body: ArrayBuffer;
  headers: Response["headers"];
  status: Response["status"];
  statusText: Response["statusText"];
}

/**
 * A basic file-system-based cache. Stores responses in JSON files keyed by MD5.
 *
 * NOTE: You may want to enhance:
 *  - concurrency control
 *  - error handling
 *  - TTL or cleanup policies
 *  - advanced serialization of headers
 */
export class FsCache {
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  public async get(key: string): Promise<CachedResponse | null> {
    const filePath = path.join(this.cacheDir, key + ".json");
    try {
      const data = await fs.readFile(filePath, "utf8");
      const { body, headers, status, statusText } = JSON.parse(data);

      // Convert the base64 string back to a Buffer
      const buffer = Buffer.from(body, "base64");

      // Convert the Buffer to an ArrayBuffer
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      ) as ArrayBuffer;

      const responseHeaders = new Headers(headers);

      return {
        body: arrayBuffer,
        headers: responseHeaders,
        status,
        statusText,
      };
    } catch (e) {
      // Cache miss or read error
      return null;
    }
  }

  public async set(key: string, value: CachedResponse): Promise<void> {
    const filePath = path.join(this.cacheDir, key + ".json");

    // Convert ArrayBuffer -> Buffer -> base64
    const bodyBuffer = Buffer.from(value.body);
    const base64Body = bodyBuffer.toString("base64");

    // Convert headers to a serializable format
    const headers: Array<[string, string]> = [];
    value.headers.forEach((v, k) => {
      headers.push([k, v]);
    });

    const data = {
      body: base64Body,
      headers,
      status: value.status,
      statusText: value.statusText,
    };

    await fs.mkdir(this.cacheDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data), "utf8");
  }
}

/**
 * A middleware that checks the file-system cache before fetching.
 * If not found, fetches from the network, caches, then returns the response.
 */
export const WretchFsCacheMiddleware = (cacheOpts: {
  cacheDir: string;
}): ConfiguredMiddleware => {
  const fsCache = new FsCache(cacheOpts.cacheDir);

  const middleware = (next: FetchLike): FetchLike => {
    const checkCache = async (
      url: string,
      opts: WretchOptions,
    ): Promise<WretchResponse> => {
      const cacheKey = getCacheKey(url, opts);

      // Try reading from the file cache
      const cachedResponse = await fsCache.get(cacheKey);
      if (cachedResponse) {
        console.log(`[FS] Cache hit for ${url}`);
        return new Response(cachedResponse.body, {
          headers: cachedResponse.headers,
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
        }) as WretchResponse;
      }

      // Cache miss => fetch from network, then store in FS
      const response = await next(url, opts);
      console.log(`[FS] Cache miss for ${url}`);

      const newResponse: CachedResponse = {
        body: await response.arrayBuffer(),
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      };

      await fsCache.set(cacheKey, newResponse);

      return new Response(newResponse.body, {
        headers: newResponse.headers,
        status: newResponse.status,
        statusText: newResponse.statusText,
      }) as WretchResponse;
    };

    return checkCache;
  };

  return middleware;
};
