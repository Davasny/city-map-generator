import * as THREE from "three";

export const createScene = (): THREE.Scene => {
  const scene = new THREE.Scene();

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

  return scene;
};
