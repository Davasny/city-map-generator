import wretch, { Wretch } from "wretch";
import osmtogeojson from "osmtogeojson";

export class OverpassClient {
  private readonly wretch: Wretch;

  constructor() {
    this.wretch = wretch().url("https://overpass-api.de/api/interpreter");
  }

  private getOverpassBody = (query: string) => {
    return `data=${encodeURIComponent(query)}`;
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

    const response = await this.wretch
      .post(this.getOverpassBody(overpassQuery))
      .json<object>();

    const geojson = osmtogeojson(response);

    return geojson;
  };
}
