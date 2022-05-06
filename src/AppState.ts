import * as THREE from 'three';
import { action, makeObservable, observable } from 'mobx';

import { CameraManager } from './state/CameraManager';
import { CanvasListener } from './utils/CanvasListener';
import { ModelLoader } from './utils/ModelLoader';
import { MouseListener } from './utils/MouseListener';
import { SceneState } from './state/SceneState';
import { WorldClock } from './state/WorldClock';

/**
 * High level state class, handles renderer and main game loop
 */
export class AppState {
  public loaded = false;
  public worldClock = new WorldClock();
  public cameraManager: CameraManager;
  private canvasListener: CanvasListener;
  private mouseListener = new MouseListener();
  private renderer: THREE.WebGLRenderer;
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
    modelLoader.loadAllModels(() => this.onAssetsLoaded(modelLoader));

    // MobX
    makeObservable(this, {
      loaded: observable,
    });
  }

  private onCanvasResize = () => {
    this.renderer.setSize(this.canvasListener.width, this.canvasListener.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private onAssetsLoaded(modelLoader: ModelLoader) {
    // Start camera manager
    this.cameraManager = new CameraManager(this.canvasListener);

    // Setup scene
    this.sceneState = new SceneState(
      this.cameraManager,
      this.worldClock,
      this.mouseListener,
      modelLoader
    );
    this.sceneState.buildScene();

    // Can now start the main game loop
    this.loaded = true;
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Get delta time for this frame
    const deltaTime = this.worldClock.delta;

    // Update world clock
    this.worldClock.update(deltaTime);

    // Update scene
    this.sceneState.updateScene(deltaTime);

    // Update cameras
    this.cameraManager.update(deltaTime);

    // Render
    this.renderer.render(this.sceneState.scene, this.cameraManager.camera);
  };
}
