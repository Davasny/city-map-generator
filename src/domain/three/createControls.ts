import * as THREE from "three";
import CameraControls from "camera-controls";

export const createControls = (
  camera: THREE.PerspectiveCamera,
  container: HTMLCanvasElement,
) => {
  const controls = new CameraControls(camera, container);

  controls.smoothTime = 0.05;
  controls.draggingSmoothTime = 0.05;
  controls.truckSpeed = 2;

  controls.minDistance = 0.05;
  controls.maxDistance = 5;

  return controls;
};
