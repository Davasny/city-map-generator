import * as THREE from "three";

export const createCamera = () => {
  const camera = new THREE.PerspectiveCamera(
    25,
    window.innerWidth / window.innerHeight,
    0.01,
    1000000000,
  );

  camera.up = new THREE.Vector3(0, 0, 1);

  return camera;
};
