import * as THREE from "three";
import CameraControls from "camera-controls";

export const createControls = (
  camera: THREE.PerspectiveCamera,
  container: HTMLCanvasElement,
  initialCameraTarget: {
    x: number;
    y: number;
  },
) => {
  const controls = new CameraControls(camera, container);

  controls.smoothTime = 0.05;
  controls.draggingSmoothTime = 0.05;
  controls.truckSpeed = 2;

  controls.setLookAt(
    initialCameraTarget.x,
    initialCameraTarget.y,
    0,
    initialCameraTarget.x,
    initialCameraTarget.y,
    0,
  );

  controls.dolly(-5000);

  console.log(initialCameraTarget);

  return controls;
};
