import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import { GeoJSON } from "geojson";

export const getBoundaries = async (
  name: string,
  type: "city" | "district",
) => {
  return wretch()
    .url("/api/administrative-boundary")
    .addon(QueryStringAddon)
    .query({ name, type })
    .get()
    .json<{ features: GeoJSON.Feature[] }>();
};
