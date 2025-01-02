import * as THREE from "three";

export const createCamera = () => {
  return new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100000000,
  );
};
