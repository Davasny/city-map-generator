import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import { GeoJSON } from "geojson";

export const getRoads = async (name: string) => {
  return wretch()
    .url("/api/roads")
    .addon(QueryStringAddon)
    .query({ name })
    .get()
    .json<{ features: GeoJSON.Feature[] }>();
};
