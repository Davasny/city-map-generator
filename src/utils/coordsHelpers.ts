import { SphericalMercator } from "@mapbox/sphericalmercator";
import { DEFAULTS } from "@/consts/defaults";

export const convertCoordsToMercator = (
  lat: number,
  lon: number,
  scaleFactor: number = DEFAULTS.map_scale,
): [number, number] => {
  const mercator = new SphericalMercator();
  const [x, y] = mercator.forward([lat, lon]);

  const scaledX = x * scaleFactor;
  const scaledY = y * scaleFactor;

  return [scaledX, scaledY];
};
