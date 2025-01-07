import { NextRequest } from "next/server";
import { OverpassClient } from "@/domain/overpass/OverpassClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters: name" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const overpassClient = OverpassClient.getInstance();
    const response = await overpassClient.getBuildings(name);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data from Overpass API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch data from Overpass API" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
