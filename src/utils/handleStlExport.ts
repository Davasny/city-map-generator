"use client";

// @ts-expect-error
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { Scene } from "three";

export const handleStlExport = (scene: Scene): void => {
  const exporter = new STLExporter();
  const result = exporter.parse(scene, { binary: false });
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  const fileName = `export - ${year}-${month}-${day} - ${hour}-${minute}-${second}.stl`;

  // Create a blob and download link
  const blob = new Blob([result], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  // Programmatically click the link to trigger download
  link.click();

  // Cleanup
  URL.revokeObjectURL(link.href);
};
