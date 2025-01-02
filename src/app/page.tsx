"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { handleStlExport } from "@/domain/three/handleStlExport";
import { convertCoordsToMercator } from "@/utils/coordsHelpers";
import geo from "../data/1.geojson";
import { FeatureCollection, Polygon } from "geojson";
import { createObject } from "@/domain/three/createObject";
import { createScene } from "@/domain/three/createScene";
import { createCamera } from "@/domain/three/createCamera";
import { createRenderer } from "@/domain/three/createRenderer";
import { createControls } from "@/domain/three/createControls";
import { getBoundaries } from "@/domain/api/getBoundaries";
import { useQuery } from "@tanstack/react-query";
import { findCentroid } from "@/utils/getPolygonCenterPoint";
import { getBuildings } from "@/domain/api/getBuildings";
import { getRoads } from "@/domain/api/getRoads";

const NAVBAR_HEIGHT_PX = 64;

const LandingPage = () => {
  const threeContainer = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.Renderer | null>(null);

  let [baseX, baseY] = [0, 0];

  const boundaries = useQuery({
    queryKey: ["Czyżyny", "district"],
    queryFn: () => getBoundaries("Czyżyny", "district"),
  });

  // const buildings = useQuery({
  //   queryKey: ["Czyżyny", "buildings"],
  //   queryFn: () => getBuildings("Czyżyny"),
  // });

  const roads = useQuery({
    queryKey: ["Czyżyny", "roads"],
    queryFn: () => getRoads("Czyżyny"),
  });

  if (boundaries.data) {
    const centerPoint = findCentroid(
      boundaries.data?.features[0]?.geometry.coordinates[0],
    );

    if (centerPoint && centerPoint.length === 2) {
      [baseX, baseY] = convertCoordsToMercator(centerPoint[0], centerPoint[1]);
    }
  }

  // buildings.data?.features.forEach(
  //   (f) =>
  //     sceneRef.current &&
  //     createObject(f, sceneRef.current, "#898b9c", undefined, 0.5),
  // );

  roads.data?.features.forEach(
    (f) =>
      sceneRef.current &&
      createObject(f, sceneRef.current, "#898b9c", undefined, 0.5),
  );

  // boundaries.data?.features?.forEach(
  //   (f) =>
  //     sceneRef.current && createObject(f, sceneRef.current, "#55cd67", -100),
  // );

  if (cameraRef.current && threeContainer.current) {
    createControls(cameraRef.current, threeContainer.current, {
      x: baseX,
      y: baseY,
    });
  }

  useEffect(() => {
    if (!threeContainer.current) return;
    if (!sceneRef.current) {
      sceneRef.current = createScene();

      cameraRef.current = createCamera();
      rendererRef.current = createRenderer(
        sceneRef.current,
        cameraRef.current,
        NAVBAR_HEIGHT_PX,
      );
      threeContainer.current.appendChild(rendererRef.current.domElement);
    }

    return () => {
      if (threeContainer.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        threeContainer.current.removeChild(threeContainer.current.firstChild!);
      }

      if (sceneRef.current) {
        sceneRef.current = null;
      }
    };
  }, [baseX, baseY]);

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
