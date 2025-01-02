import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import { GeoJSON } from "geojson";

export const getBuildings = async (name: string) => {
  return wretch()
    .url("/api/buildings")
    .addon(QueryStringAddon)
    .query({ name })
    .get()
    .json<{ features: GeoJSON.Feature[] }>();
};
