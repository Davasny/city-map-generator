"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ArcballControls } from "three/examples/jsm/controls/ArcballControls.js";
import { Button } from "@/components/ui/button";
import { handleStlExport } from "@/utils/handleStlExport";

const LandingPage = () => {
  const [isGizmosVisible, setIsGizmosVisible] = useState(true);

  const threeContainer = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const arcballControlRef = useRef<ArcballControls | null>(null);

  const navbarHeightPx = 64;

  useEffect(() => {
    if (!threeContainer.current) return;

    // --- scene --- //

    if (!sceneRef.current) {
      sceneRef.current = new THREE.Scene();
    }

    const scene = sceneRef.current;

    scene.background = new THREE.Color("#FFFFFF");

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
      1000,
    );

    // --- renderer --- //

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight - navbarHeightPx);
    threeContainer.current.appendChild(renderer.domElement);

    // --- controls --- //

    arcballControlRef.current = new ArcballControls(
      camera,
      threeContainer.current,
      scene,
    );
    arcballControlRef.current.addEventListener("change", function () {
      if (scene) renderer.render(scene, camera);
    });
    // arcballControlRef.current.setGizmosVisible(false)

    camera.position.set(20, 20, 20);
    arcballControlRef.current.update();

    // --- geometry --- //

    const geometry = new THREE.BoxGeometry(30, 0.2, 3);
    const material = new THREE.MeshStandardMaterial({ color: 0x049ef4 });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    // render after all
    renderer.render(scene, camera);

    return () => {
      if (threeContainer.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        threeContainer.current.removeChild(threeContainer.current.firstChild!);
      }

      if (sceneRef.current) {
        sceneRef.current = null;
      }
    };
  }, []);

  return (
    <Flex flexDir="column">
      <Flex
        h={`${navbarHeightPx}px`}
        w="100%"
        alignItems="center"
        justifyContent="flex-end"
        borderBottom="2px solid"
        borderBottomColor="gray.200"
        p={2}
      >
        <Flex gap={2}>
          <Button
            onClick={() => {
              if (arcballControlRef.current) {
                setIsGizmosVisible(!isGizmosVisible);
                arcballControlRef.current.setGizmosVisible(!isGizmosVisible);
              }
            }}
          >
            switch gizmos
          </Button>
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
