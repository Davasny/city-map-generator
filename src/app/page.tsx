"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { handleStlExport } from "@/domain/three/handleStlExport";
import { convertCoordsToMercator } from "@/utils/coordsHelpers";
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
import lineStringToPolygon from "@/utils/lineStringToPolygon";
import CameraControls from "camera-controls";
import { DEFAULTS } from "@/consts/defaults";

CameraControls.install({ THREE: THREE });

const NAVBAR_HEIGHT_PX = 64;

const LandingPage = () => {
  const threeContainer = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<CameraControls | null>(null);

  const boundaries = useQuery({
    queryKey: ["Czyżyny", "district"],
    queryFn: () => getBoundaries("Czyżyny", "district"),
  });

  const buildings = useQuery({
    queryKey: ["Czyżyny", "buildings"],
    queryFn: () => getBuildings("Czyżyny"),
  });

  const roads = useQuery({
    queryKey: ["Czyżyny", "roads"],
    queryFn: () => getRoads("Czyżyny"),
  });

  if (boundaries.data) {
    const geometry = boundaries.data.features[0].geometry;
    if (geometry.type === "Polygon") {
      // @ts-expect-error
      const centerPoint = findCentroid(geometry.coordinates[0]);

      if (centerPoint && centerPoint.length === 2) {
        const [x, y] = convertCoordsToMercator(centerPoint[0], centerPoint[1]);
        controlsRef.current?.setLookAt(x, y, 2, x, y, 0);
      }
    }
  }

  buildings.data?.features.forEach(
    (f) =>
      sceneRef.current &&
      createObject(f, sceneRef.current, "#8f3939", undefined, 0),
  );

  roads.data?.features.forEach((road) => {
    let newRoad = road;

    if (road.type === "Feature" && road.geometry.type === "LineString") {
      // @ts-expect-error
      newRoad = lineStringToPolygon(road, 0.0001);
    }

    return (
      sceneRef.current &&
      createObject(newRoad, sceneRef.current, "#9b9b9b", DEFAULTS.street_height)
    );
  });

  boundaries.data?.features?.forEach(
    (f) =>
      sceneRef.current &&
      createObject(f, sceneRef.current, "#4db65c", DEFAULTS.base_height),
  );

  useEffect(() => {
    if (!threeContainer.current) return;
    if (!sceneRef.current) {
      sceneRef.current = createScene();

      cameraRef.current = createCamera();

      controlsRef.current = createControls(
        cameraRef.current,
        threeContainer.current,
      );

      rendererRef.current = createRenderer(
        sceneRef.current,
        cameraRef.current,
        controlsRef.current,
        NAVBAR_HEIGHT_PX,
      );

      threeContainer.current.appendChild(rendererRef.current.domElement);

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    return () => {
      if (threeContainer.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        threeContainer.current.removeChild(threeContainer.current.firstChild!);
      }

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, []);

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
