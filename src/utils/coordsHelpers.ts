import { SphericalMercator } from "@mapbox/sphericalmercator";

export const convertCoordsToMercator = (
  lat: number,
  lon: number,
): [number, number] => {
  const mercator = new SphericalMercator();
  const [x, y] = mercator.forward([lon, lat]);
  return [x, y];
};

export const convertCoordsToPx = (
  lat: number,
  lon: number,
): [number, number] => {
  const mercator = new SphericalMercator();
  const [x, y] = mercator.px([lon, lat], 10);
  return [x, y];
};
