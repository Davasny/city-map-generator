import { describe, expect, it } from "vitest";
import { OverpassClient } from "@/domain/overpass/OverpassClient";

describe("Overpass Client", () => {
  it("Checks if getBoundaries returns exactly one match", async () => {
    // without passing admin_level in overpass query it will return 3 matches

    const overpassClient = new OverpassClient();
    const response = await overpassClient.getBoundaries("Czyżyny", "district");

    expect(response.type).toBe("FeatureCollection");
    expect(response.features.length).toBe(1);
  });
});
