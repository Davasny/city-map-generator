"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { handleStlExport } from "@/utils/handleStlExport";
// @ts-expect-error
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { convertCoordsToMercator } from "@/utils/coordsHelpers";

const street = {
  type: "Feature",
  properties: {
    "@id": "way/79814116",
    building: "yes",
    "building:levels": "2",
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [20.0080945, 50.0698825],
        [20.0071929, 50.069945],
        [20.0070295, 50.0689732],
        [20.0079311, 50.0689108],
        [20.0080945, 50.0698825],
      ],
    ],
  },
  id: "way/79814116",
};

const NAVBAR_HEIGHT_PX = 64;

const LandingPage = () => {
  const threeContainer = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const orbitControlRef = useRef<OrbitControls | null>(null);

  const streetCoordinates = street.geometry.coordinates[0].map(([x, y]) =>
    convertCoordsToMercator(x, y),
  );
  const [baseX, baseY] = streetCoordinates[0];

  useEffect(() => {
    if (!threeContainer.current) return;

    // --- scene --- //

    if (!sceneRef.current) {
      sceneRef.current = new THREE.Scene();
    }

    const scene = sceneRef.current;

    scene.background = new THREE.Color("#FFFFFF");

    // --- axes --- //

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // --- lights --- //

    const ambientLight = new THREE.AmbientLight(0x000000);
    scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xffffff, 3);
    light1.position.set(0, 200, 0);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 3);
    light2.position.set(100, 200, 100);
    scene.add(light2);

    const light3 = new THREE.DirectionalLight(0xffffff, 3);
    light3.position.set(-100, -200, -100);
    scene.add(light3);

    // --- camera --- //

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000000,
    );

    // --- renderer --- //

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight - NAVBAR_HEIGHT_PX);
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    threeContainer.current.appendChild(renderer.domElement);

    // --- controls --- //

    orbitControlRef.current = new OrbitControls(camera, threeContainer.current);
    orbitControlRef.current.minDistance = 1;
    orbitControlRef.current.maxDistance = 5000000;
    orbitControlRef.current.target = new THREE.Vector3(baseX, baseY, 10);

    camera.position.set(baseX, baseY, 20);
    orbitControlRef.current.update();

    // --- geometry --- //

    const shape = new THREE.Shape();
    streetCoordinates.forEach((coord, index) => {
      const [x, y] = [coord[0], coord[1]];

      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });

    // Close the shape if not already closed
    if (
      streetCoordinates[0] !== streetCoordinates[streetCoordinates.length - 1]
    ) {
      const [lon, lat] = streetCoordinates[0];
      shape.lineTo(lon, lat);
    }

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 10,
      bevelEnabled: false,
    });

    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return () => {
      if (threeContainer.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        threeContainer.current.removeChild(threeContainer.current.firstChild!);
      }

      if (sceneRef.current) {
        sceneRef.current = null;
      }
    };
  }, [baseX, baseY, streetCoordinates]);

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
