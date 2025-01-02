import baseWretch from "wretch";
import { WretchLruMiddleware } from "@/api/cache/WretchLruMiddleware";

export const apiClient = baseWretch().middlewares([
  WretchLruMiddleware({
    ttl: 1000 * 60 * 60,
    max: 1000,
  }),
]);
