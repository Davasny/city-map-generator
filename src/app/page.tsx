"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { handleStlExport } from "@/utils/handleStlExport";
import { convertCoordsToMercator } from "@/utils/coordsHelpers";
import geo from "../data/1.geojson";
import { FeatureCollection, Polygon } from "geojson";
import { createObject } from "@/utils/createObject";
import { createScene } from "@/utils/createScene";
import { createCamera } from "@/utils/createCamera";
import { createRenderer } from "@/utils/createRenderer";
import { createControls } from "@/utils/createControls";

const NAVBAR_HEIGHT_PX = 64;

const LandingPage = () => {
  const threeContainer = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const geoFeatures = (geo as FeatureCollection).features;
  const firstPolygon = geoFeatures.find((f) => f.geometry.type === "Polygon");

  let [baseX, baseY] = [0, 0];

  if (firstPolygon) {
    const geometry = firstPolygon.geometry as Polygon;
    [baseX, baseY] = convertCoordsToMercator(
      geometry.coordinates[0][0][0],
      geometry.coordinates[0][0][1],
    );
  }

  geoFeatures.forEach((f) => {
    if (f.geometry.type !== "Polygon") {
      console.log(f.geometry.type);
    }
  });

  useEffect(() => {
    if (!threeContainer.current) return;
    if (!sceneRef.current) {
      sceneRef.current = createScene();
    }

    const camera = createCamera();
    const renderer = createRenderer(sceneRef.current, camera, NAVBAR_HEIGHT_PX);
    threeContainer.current.appendChild(renderer.domElement);

    createControls(camera, threeContainer.current, {
      x: baseX,
      y: baseY,
    });

    geoFeatures.forEach((f) => {
      const obj = createObject(f);
      if (!obj || !sceneRef.current) return;
      sceneRef.current.add(obj);
    });

    return () => {
      if (threeContainer.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        threeContainer.current.removeChild(threeContainer.current.firstChild!);
      }

      if (sceneRef.current) {
        sceneRef.current = null;
      }
    };
  }, [baseX, baseY, geoFeatures]);

  return (
    <Flex flexDir="column">
      <Flex
        h={`${NAVBAR_HEIGHT_PX}px`}
        w="100%"
        alignItems="center"
        justifyContent="flex-end"
        borderBottom="2px solid"
        borderBottomColor="gray.200"
        p={2}
      >
        <Flex gap={2}>
          <Button
            onClick={() =>
              sceneRef.current && handleStlExport(sceneRef.current)
            }
          >
            export stl
          </Button>
        </Flex>
      </Flex>
      <Box ref={threeContainer} />
    </Flex>
  );
};

export default LandingPage;
