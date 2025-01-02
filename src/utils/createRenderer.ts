import * as THREE from "three";

export const createRenderer = (
  scene: THREE.Scene,
  camera: THREE.Camera,
  navbarHeight: number,
): THREE.Renderer => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight - navbarHeight);
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  return renderer;
};
