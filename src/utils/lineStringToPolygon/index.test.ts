import { describe, expect, it } from "vitest";
import lineStringToPolygon from "@/utils/lineStringToPolygon/index";
import type { Feature, LineString } from "geojson";

describe("lineStringToPolygon", () => {
  it("should return rectangle for straight line (Case #3)", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 0],
        ],
      },
    };

    const result = lineStringToPolygon(feature, 2);
    const newPolygon = result.geometry.coordinates[0];

    expect(newPolygon).toEqual([
      [0, 1],
      [1, 1],
      [1, -1],
      [0, -1],
      [0, 1],
    ]);
  });

  it("Should return polygon for curved line (Case #4)", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 0],
          [2, 1],
          [2, 2],
        ],
      },
    };

    const result = lineStringToPolygon(feature, 2);
    const newPolygon = result.geometry.coordinates[0];

    const expectedPolygonPoints = [
      [0, 1],

      // double because two points results in the same position
      [1, 1],
      [1, 1],

      [1, 2],
      [3, 2],
      [3, 1],

      [1, -1],
      [0, -1],

      [0, 1],
    ];

    for (let i = 0; i < expectedPolygonPoints.length; i++) {
      expect(newPolygon[i][0]).toBeCloseTo(expectedPolygonPoints[i][0], 0);
      expect(newPolygon[i][1]).toBeCloseTo(expectedPolygonPoints[i][1], 0);
    }
  });

  it("Checks if all properties are returned", () => {
    const feature: Feature<LineString> = {
      type: "Feature",
      id: "1",
      properties: {
        test: "test",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 0],
        ],
      },
    };

    const result = lineStringToPolygon(feature, 2);
    expect(result.type).toBe("Feature");
    expect(result.id).toBe("1");
    expect(result.properties).toEqual({ test: "test" });
    expect(result.geometry.type).toBe("Polygon");
  });
});
