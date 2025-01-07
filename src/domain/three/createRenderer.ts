import * as THREE from "three";
import CameraControls from "camera-controls";

export const createRenderer = (
  scene: THREE.Scene,
  camera: THREE.Camera,
  controls: CameraControls,
  navbarHeight: number,
): THREE.WebGLRenderer => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight - navbarHeight);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    const hasControlsUpdated = controls.update(delta);

    // Render only if the controls have updated
    if (hasControlsUpdated) {
      renderer.render(scene, camera);
    }
  });

  return renderer;
};
