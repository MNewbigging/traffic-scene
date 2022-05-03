import * as THREE from 'three';

import { CanvasListener } from './utils/CanvasListener';
import { MouseListener } from './utils/MouseListener';
import { SceneState } from './state/SceneState';
import { ModelLoader } from './utils/ModelLoader';
import { WorldClock } from './state/WorldClock';

/**
 * High level state class, handles renderer and main game loop
 */
export class AppState {
  private canvasListener: CanvasListener;
  private mouseListener = new MouseListener();
  private renderer: THREE.WebGLRenderer;
  private worldClock = new WorldClock();
  private sceneState: SceneState;

  constructor(canvas: HTMLCanvasElement) {
    // Setup screen listener
    this.canvasListener = new CanvasListener(canvas);
    this.canvasListener.addCanvasListener(this.onCanvasResize);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.onCanvasResize();

    // Load assets
    const modelLoader = new ModelLoader();
    modelLoader.loadAllModels(() => {
      // Setup scene
      this.sceneState = new SceneState(this.canvasListener, this.mouseListener, modelLoader);
      this.sceneState.buildScene();

      // Can now start the main game loop
      this.animate();
    });
  }

  private onCanvasResize = () => {
    this.renderer.setSize(this.canvasListener.width, this.canvasListener.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private animate = () => {
    requestAnimationFrame(this.animate);

    const deltaTime = this.worldClock.delta;
    this.sceneState.updateScene(deltaTime);

    this.renderer.render(this.sceneState.scene, this.sceneState.camera);
  };
}
