import { afterEach, describe, expect, it, vi } from "vitest";
import baseWretch from "wretch";
import { WretchLruMiddleware } from "@/api/cache/WretchLruMiddleware";

describe("WretchLruMiddleware", () => {
  const consoleMock = vi
    .spyOn(console, "log")
    .mockImplementation(() => undefined);

  afterEach(() => {
    consoleMock.mockReset();
  });

  it("Check if first GET response is not cached", async () => {
    const client = baseWretch().middlewares([WretchLruMiddleware()]);

    const url = "https://echo.free.beeceptor.com";
    await client.url(url).get().json();
    expect(consoleMock).toHaveBeenLastCalledWith(`Cache miss for ${url}`);
  });

  it("Check if subsequent GET responses are cached", async () => {
    const client = baseWretch().middlewares([WretchLruMiddleware()]);
    const url = "https://echo.free.beeceptor.com?test=true";

    const numberOfRequests = 10;
    const responses = [];

    for (let i = 0; i < numberOfRequests; i++) {
      const response = await client.url(url).get().json<{
        parsedQueryParams: { test: boolean };
      }>();
      responses.push(response);
    }

    responses.forEach((response) => {
      expect(response.parsedQueryParams.test).toBeTruthy();
    });

    // Verify cache behavior for each request
    expect(consoleMock).toHaveBeenNthCalledWith(1, `Cache miss for ${url}`);
    for (let i = 2; i <= numberOfRequests; i++) {
      expect(consoleMock).toHaveBeenNthCalledWith(i, `Cache hit for ${url}`);
    }
  });

  it("Check if first POST response is not cached", async () => {
    const client = baseWretch().middlewares([WretchLruMiddleware()]);

    const url = "https://echo.free.beeceptor.com";
    await client.url(url).post({ payload: "nothing" }).json();

    expect(consoleMock).toHaveBeenNthCalledWith(1, `Cache miss for ${url}`);
  });

  it("Check if second POST response cached", async () => {
    const client = baseWretch().middlewares([WretchLruMiddleware()]);

    const url = "https://echo.free.beeceptor.com";
    await client.url(url).post({ payload: "nothing" }).json();
    await client.url(url).post({ payload: "nothing" }).json();
    await client.url(url).post({ payload: "nothing" }).json();

    expect(consoleMock).toHaveBeenNthCalledWith(1, `Cache miss for ${url}`);
    expect(consoleMock).toHaveBeenNthCalledWith(2, `Cache hit for ${url}`);
    expect(consoleMock).toHaveBeenNthCalledWith(3, `Cache hit for ${url}`);
  });

  it("Check if multiple POST response cache returns correct values", async () => {
    const client = baseWretch().middlewares([WretchLruMiddleware()]);

    const url = "https://echo.free.beeceptor.com";
    const response1 = await client
      .url(url)
      .post({ payload: "test1" })
      .json<{ parsedBody: { payload: string } }>();

    const response2 = await client
      .url(url)
      .post({ payload: "test2" })
      .json<{ parsedBody: { payload: string } }>();

    expect(response1.parsedBody.payload).toBe("test1");
    expect(response2.parsedBody.payload).toBe("test2");
  });

  it("Check if concurrent POST requests finish correctly", async () => {
    const client = baseWretch().middlewares([WretchLruMiddleware()]);

    const url = "https://echo.free.beeceptor.com";
    const response1 = client
      .url(url)
      .post({ payload: "test1" })
      .json<{ parsedBody: { payload: string } }>();

    const response2 = client
      .url(url)
      .post({ payload: "test2" })
      .json<{ parsedBody: { payload: string } }>();

    const response3 = client
      .url(url)
      .post({ payload: "test3" })
      .json<{ parsedBody: { payload: string } }>();

    const [r1, r2, r3] = await Promise.all([response1, response2, response3]);

    expect(r1.parsedBody.payload).toBe("test1");
    expect(r2.parsedBody.payload).toBe("test2");
    expect(r3.parsedBody.payload).toBe("test3");
  });
});
