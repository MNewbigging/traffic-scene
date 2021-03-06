import * as THREE from 'three';

import { CameraFactory } from './cameras/CameraFactory';
import { CameraManager } from './cameras/CameraManager';
import { CanvasListener } from './listeners/CanvasListener';
import { GameEventListener } from './listeners/GameEventListener';
import { KeyboardListener } from './listeners/KeyboardListener';
import { ModelLoader } from '../loaders/ModelLoader';
import { MouseListener } from './listeners/MouseListener';
import { SceneSelector } from '../utils/SceneSelector';
import { SceneState } from './SceneState';
import { WorldClock } from './WorldClock';

/**
 * High level state class, handles renderer and main game loop
 */
export class GameState {
  public worldClock = new WorldClock();
  public cameraManager: CameraManager;
  private gameEventListener: GameEventListener;
  private canvasListener: CanvasListener;
  private mouseListener = new MouseListener();
  private keyboardListener = new KeyboardListener();
  private scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer;
  private sceneState: SceneState;
  private sceneSelector: SceneSelector;

  constructor(
    canvas: HTMLCanvasElement,
    modelLoader: ModelLoader,
    eventListener: GameEventListener
  ) {
    this.gameEventListener = eventListener;

    // Setup screen listener
    this.canvasListener = new CanvasListener(canvas);
    this.canvasListener.addCanvasListener(this.onCanvasResize);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.onCanvasResize();

    // Build the camera manager
    this.cameraManager = CameraFactory.buildCameraManager({
      canvasListener: this.canvasListener,
      mouseListener: this.mouseListener,
      keyboardListener: this.keyboardListener,
      gameEventListener: this.gameEventListener,
    });

    // Setup scene
    this.sceneState = new SceneState(this.scene, this.worldClock, modelLoader);
    this.sceneState.buildScene();

    // Scene selector
    this.sceneSelector = new SceneSelector(
      this.sceneState,
      this.cameraManager,
      this.mouseListener,
      this.gameEventListener
    );
  }

  public start() {
    // Can now start the main game loop
    this.update();
  }

  private onCanvasResize = () => {
    this.renderer.setSize(this.canvasListener.width, this.canvasListener.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private update = () => {
    requestAnimationFrame(this.update);

    // Get delta time for this frame
    const deltaTime = this.worldClock.delta;

    // Update world clock
    this.worldClock.update(deltaTime);

    // Update scene
    this.sceneState.updateScene(deltaTime);

    // Update cameras
    this.cameraManager.update(deltaTime);

    // Render
    this.renderer.render(this.scene, this.cameraManager.camera);

    // Post update
    this.mouseListener.postUpdate();
  };
}
