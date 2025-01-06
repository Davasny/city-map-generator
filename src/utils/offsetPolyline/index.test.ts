import { describe, expect, it } from "vitest";
import offsetPolyline from "@/utils/offsetPolyline";

describe("offsetPolyline", () => {
  it("Should return offset polyline for straight line (Case #1)", () => {
    const line = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];

    const newPolyline = offsetPolyline(line, 1);

    expect(newPolyline).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it("Should return offset polyline for curved line (Case #2)", () => {
    const line = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ];

    const newPolyline = offsetPolyline(line, -1);

    const expectedClosePoints = [
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
    ];

    for (let i = 0; i < newPolyline.length; i++) {
      expect(newPolyline[i].x).toBeCloseTo(expectedClosePoints[i].x, 0);
      expect(newPolyline[i].y).toBeCloseTo(expectedClosePoints[i].y, 0);
    }
  });
});
