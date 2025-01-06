/* file created by model o1 */

interface Point {
  x: number;
  y: number;
}

/**
 * Offsets a polyline by a specified distance. Positive distance offsets
 * to one “side” and negative to the opposite. For an open polyline, the
 * first and last points are offset in the direction of the single adjacent
 * segment's normal.
 *
 * @param points   Array of { x, y } defining the original polyline.
 * @param distance Amount to offset the polyline (positive or negative).
 * @returns        A new array of { x, y } representing the offset polyline.
 */
function offsetPolyline(points: Point[], distance: number): Point[] {
  const n = points.length;
  if (n < 2) {
    // A single point or empty array can't really be offset in a meaningful way.
    return [...points];
  }

  // 1. Compute normals for each segment
  //    Normal is perpendicular to the segment, pointing "left" if distance > 0
  //    or "right" if distance < 0, depending on the sign convention below.
  const normals: Point[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      // Degenerate segment: two identical points in a row
      normals.push({ x: 0, y: 0 });
    } else {
      // A normal to (dx, dy) is (-dy, dx) or (dy, -dx).
      // We’ll pick (-dy, dx) so that a positive distance offsets in that direction.
      // Then we'll scale it to unit length.
      normals.push({
        x: -dy / length,
        y: dx / length,
      });
    }
  }

  // 2. Build the offset polyline.
  //    - For the first point, use the first normal
  //    - For the last point, use the last normal
  //    - For intermediate points, average the two adjacent normals
  const offsetPoints: Point[] = [];

  // Offset the first point using the first segment’s normal
  offsetPoints[0] = {
    x: points[0].x + distance * normals[0].x,
    y: points[0].y + distance * normals[0].y,
  };

  // Offset the middle points
  for (let i = 1; i < n - 1; i++) {
    const prevN = normals[i - 1];
    const nextN = normals[i];

    // Sum adjacent normals
    let nx = prevN.x + nextN.x;
    let ny = prevN.y + nextN.y;
    const len = Math.sqrt(nx * nx + ny * ny);

    if (len === 0) {
      // Degenerate case: the two segment normals cancel out or are zero
      // Just use one of them (e.g. nextN) to offset
      offsetPoints[i] = {
        x: points[i].x + distance * nextN.x,
        y: points[i].y + distance * nextN.y,
      };
    } else {
      // Normalize the sum of the normals and then scale by distance
      nx /= len;
      ny /= len;
      offsetPoints[i] = {
        x: points[i].x + distance * nx,
        y: points[i].y + distance * ny,
      };
    }
  }

  // Offset the last point using the last segment’s normal
  offsetPoints[n - 1] = {
    x: points[n - 1].x + distance * normals[n - 2].x,
    y: points[n - 1].y + distance * normals[n - 2].y,
  };

  return offsetPoints;
}

export default offsetPolyline;
