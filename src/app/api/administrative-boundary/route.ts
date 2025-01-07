import { NextRequest } from "next/server";
import { OverpassClient } from "@/domain/overpass/OverpassClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const type = searchParams.get("type");

  if (!name || !type) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters: name or type" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (type !== "city" && type !== "district") {
    return new Response(
      JSON.stringify({
        error: "Invalid type. Valid values are 'city' or 'district'",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const overpassClient = OverpassClient.getInstance();
    const response = await overpassClient.getBoundaries(name, type);

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
