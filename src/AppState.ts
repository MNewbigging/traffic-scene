import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from './utils/CanvasListener';
import { SceneState } from './state/SceneState';

/**
 * High level state class, handles renderer and main game loop
 */
export class AppState {
  private canvasListener: CanvasListener;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private masterClock = new THREE.Clock();
  private sceneState = new SceneState();

  constructor(canvas: HTMLCanvasElement) {
    // Setup screen listener
    this.canvasListener = new CanvasListener(canvas);
    this.canvasListener.addCanvasListener(this.onCanvasResize);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.onCanvasResize();

    // Setup camera
    this.setupCamera();

    // Setup scene
    this.sceneState.initScene(() => this.start());
  }

  private start() {
    // Start render loop
    this.animate();
  }

  private onCanvasResize = () => {
    this.renderer.setSize(this.canvasListener.width, this.canvasListener.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      this.canvasListener.width / this.canvasListener.height,
      0.1,
      1000
    );
    camera.position.x = 2;
    camera.position.y = 2;
    camera.position.z = 2;

    this.camera = camera;
    this.controls = new OrbitControls(this.camera, this.canvasListener.canvas);
    this.controls.enableDamping = true;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    this.controls.update();

    //const deltaTime = this.masterClock.getDelta();

    this.renderer.render(this.sceneState.scene, this.camera);
  };
}
