import { SphericalMercator } from "@mapbox/sphericalmercator";

export const convertCoordsToMercator = (
  lat: number,
  lon: number,
): [number, number] => {
  const mercator = new SphericalMercator();
  const [x, y] = mercator.forward([lat, lon]);
  return [x, y];
};
