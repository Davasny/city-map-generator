type Point = [number, number];

export const findCentroid = (points: Point[]): Point | null => {
  const n = points.length;
  if (n < 3) {
    // Not a polygon
    return null;
  }

  let area = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let i = 0; i < n; i++) {
    const x1 = points[i][0];
    const y1 = points[i][1];
    const x2 = points[(i + 1) % n][0];
    const y2 = points[(i + 1) % n][1];

    const crossProduct = x1 * y2 - x2 * y1;
    area += crossProduct;
    centroidX += (x1 + x2) * crossProduct;
    centroidY += (y1 + y2) * crossProduct;
  }

  area *= 0.5;
  centroidX /= 6 * area;
  centroidY /= 6 * area;

  return [centroidX, centroidY];
};
