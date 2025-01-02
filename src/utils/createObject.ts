import { Feature } from "geojson";
import * as THREE from "three";
import { convertCoordsToMercator } from "@/utils/coordsHelpers";

export const createObject = (feature: Feature): THREE.Mesh | null => {
  if (!("coordinates" in feature.geometry)) {
    console.log("Skipping feature without coordinates");
    return null;
  }

  let levels = 1;
  if (feature.properties && "building:levels" in feature.properties) {
    levels = parseInt(feature.properties["building:levels"]) * 5;
  }

  const shape = new THREE.Shape();
  const coords = feature.geometry.coordinates[0];

  if (!Array.isArray(coords)) {
    console.error("Invalid coords", coords);
    return null;
  }

  coords.forEach((coord, index) => {
    if (!Array.isArray(coord)) {
      console.error("Invalid coord", coord);
      return;
    }

    if (Number.isNaN(coord[0]) || Number.isNaN(coord[1])) {
      console.error("Invalid coord", coord);
      return;
    }

    if (typeof coord[0] !== "number" || typeof coord[1] !== "number") {
      console.error("Invalid coord", coord);
      return;
    }

    const [x, y] = convertCoordsToMercator(coord[0], coord[1]);

    if (index === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  });

  // Close the shape if not already closed
  if (coords[0] !== coords[coords.length - 1]) {
    // @ts-expect-error
    const [lon, lat] = convertCoordsToMercator(coords[0][0], coords[0][1]);
    shape.lineTo(lon, lat);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: levels,
    bevelEnabled: false,
  });

  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
};
