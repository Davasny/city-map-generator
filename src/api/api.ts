import baseWretch from "wretch";
import { WretchLruMiddleware } from "@/api/cache/WretchLruMiddleware";
import { WretchFsCacheMiddleware } from "@/api/cache/WretchFsCacheMiddleware";

export const apiClient = baseWretch().middlewares([
  WretchLruMiddleware({
    ttl: 1000 * 60 * 60,
    max: 1000,
  }),
  WretchFsCacheMiddleware({
    cacheDir: "./cache",
  }),
]);
