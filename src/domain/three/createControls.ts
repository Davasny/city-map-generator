// @ts-expect-error
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";

export const createControls = (
  camera: THREE.Camera,
  container: HTMLCanvasElement,
  initialCameraTarget: {
    x: number;
    y: number;
  },
) => {
  const controls = new OrbitControls(camera, container);
  controls.minDistance = 0.01;
  controls.maxDistance = 5000000;
  controls.target = new THREE.Vector3(
    initialCameraTarget.x,
    initialCameraTarget.y,
    10,
  );

  camera.position.set(initialCameraTarget.x, initialCameraTarget.y, 2000);
  controls.update();

  return controls;
};
