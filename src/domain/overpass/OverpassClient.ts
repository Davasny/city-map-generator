import { Wretch } from "wretch";
import osmtogeojson from "osmtogeojson";
import { apiClient } from "@/api/api";

export class OverpassClient {
  private static instance: OverpassClient;
  private readonly wretch: Wretch;

  constructor() {
    this.wretch = apiClient.url("https://overpass-api.de/api/interpreter");
  }

  // Singleton instance getter
  public static getInstance(): OverpassClient {
    if (!OverpassClient.instance) {
      OverpassClient.instance = new OverpassClient();
    }
    return OverpassClient.instance;
  }

  private getOverpassBody(query: string): string {
    return `data=${encodeURIComponent(query)}`;
  }

  private async getOverpassData(query: string): Promise<object> {
    const response = await this.wretch
      .post(this.getOverpassBody(query))
      .json<object>();

    return osmtogeojson(response);
  }

  public async getBoundaries(
    name: string,
    type: "city" | "district",
  ): Promise<object> {
    const adminLevel = type === "city" ? 8 : type === "district" ? 9 : null;

    if (!adminLevel) {
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
  }

  public async getRoads(name: string): Promise<object> {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        area["name"="${name}"]["boundary"="administrative"]->.search;
        way["highway"]["highway"!="footway"]["highway"!="path"](area.search);
      );
      out geom;
    `;

    return this.getOverpassData(overpassQuery);
  }

  public async getBuildings(name: string): Promise<object> {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        area["name"="${name}"]["boundary"="administrative"]->.search;
        way["building"](area.search);
      );
      out geom;
    `;

    return this.getOverpassData(overpassQuery);
  }
}
