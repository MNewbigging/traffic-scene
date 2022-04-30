import * as THREE from 'three';

import { CanvasListener } from './utils/CanvasListener';
import { MouseListener } from './utils/MouseListener';
import { SceneState } from './state/SceneState';

/**
 * High level state class, handles renderer and main game loop
 */
export class AppState {
  private canvasListener: CanvasListener;
  private mouseListener = new MouseListener();
  private renderer: THREE.WebGLRenderer;
  private masterClock = new THREE.Clock();
  private sceneState: SceneState;

  constructor(canvas: HTMLCanvasElement) {
    // Setup screen listener
    this.canvasListener = new CanvasListener(canvas);
    this.canvasListener.addCanvasListener(this.onCanvasResize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.onCanvasResize();

    // Setup scene
    this.sceneState = new SceneState(this.canvasListener, this.mouseListener);
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

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.masterClock.stop();
    } else {
      this.masterClock.start();
    }
  };

  private animate = () => {
    requestAnimationFrame(this.animate);

    const deltaTime = this.masterClock.getDelta();
    this.sceneState.updateScene(deltaTime);

    this.renderer.render(this.sceneState.scene, this.sceneState.camera);
  };
}
