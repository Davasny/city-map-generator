/* file created by model o1 */

import type { Feature, LineString, Polygon } from "geojson";
import offsetPolyline from "@/utils/offsetPolyline";

interface Point {
  x: number;
  y: number;
}

/**
 * Converts a GeoJSON LineString into a Polygon of the given width by creating
 * offsets on both sides of the original line, then merging them into a single
 * closed polygon.
 *
 * @param lineString GeoJSON LineString feature or geometry.
 * @param width      The total desired width of the polygon (distance across).
 * @returns          A new GeoJSON Polygon feature.
 */
function lineStringToPolygon(
  lineString: Feature<LineString>,
  width: number,
): Feature<Polygon> {
  // Extract the array of coordinates

  const coords = lineString.geometry.coordinates;

  // Convert [lng, lat] coordinates into Point[] for offsetting
  const points: Point[] = coords.map(([lng, lat]) => ({ x: lng, y: lat }));

  // Offset polylines for both “sides” (+ and - half width)
  const halfWidth = width / 2;
  const offsetPlus = offsetPolyline(points, halfWidth);
  const offsetMinus = offsetPolyline(points, -halfWidth);

  // Build a polygon ring by combining offsetPlus and offsetMinus (reversed)
  // We want to go forward along one side, back along the other to close the loop
  const combinedRing = [...offsetPlus, ...offsetMinus.reverse()];

  // Ensure the polygon ring is closed by repeating the first coordinate at the end if necessary
  if (
    combinedRing.length &&
    (combinedRing[0].x !== combinedRing[combinedRing.length - 1].x ||
      combinedRing[0].y !== combinedRing[combinedRing.length - 1].y)
  ) {
    combinedRing.push(combinedRing[0]);
  }

  // Convert our ring of Points back to [lng, lat] for the GeoJSON Polygon
  const polygonCoords = combinedRing.map((p) => [p.x, p.y]);

  // Return as a valid GeoJSON Polygon Feature
  return {
    ...lineString,
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [polygonCoords],
    },
  };
}

export default lineStringToPolygon;
