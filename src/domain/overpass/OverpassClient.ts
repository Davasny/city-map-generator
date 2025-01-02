import { Wretch } from "wretch";
import osmtogeojson from "osmtogeojson";
import { apiClient } from "@/api/api";

export class OverpassClient {
  private readonly wretch: Wretch;

  constructor() {
    this.wretch = apiClient.url("https://overpass-api.de/api/interpreter");
  }

  private getOverpassBody = (query: string) => {
    return `data=${encodeURIComponent(query)}`;
  };

  private getOverpassData = async (query: string) => {
    const response = await this.wretch
      .post(this.getOverpassBody(query))
      .json<object>();

    const geojson = osmtogeojson(response);

    return geojson;
  };

  getBoundaries = async (name: string, type: "city" | "district") => {
    let adminLevel;
    if (type === "city") {
      adminLevel = 8;
    } else if (type === "district") {
      adminLevel = 9;
    } else {
      throw new Error("Invalid type. Valid values are 'city' or 'district'.");
    }

    const overpassQuery = `
      [out:json][timeout:25];
      (
        relation["name"="${name}"]["boundary"="administrative"]["admin_level"=${adminLevel}];
      );
      out geom;
    `;

    return this.getOverpassData(overpassQuery);
  };

  getRoads = async (name: string) => {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        area["name"="${name}"]["boundary"="administrative"]->.search;
        way["highway"]["highway"!="footway"]["highway"!="path"](area.search);
      );
      out geom;
    `;

    return this.getOverpassData(overpassQuery);
  };

  getBuildings = async (name: string) => {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        area["name"="${name}"]["boundary"="administrative"]->.search;
        way["building"](area.search);
      );
      out geom;
    `;

    return this.getOverpassData(overpassQuery);
  };
}
