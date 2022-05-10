import * as THREE from 'three';
import { action, computed, makeObservable, observable } from 'mobx';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { CanvasListener } from '../listeners/CanvasListener';
import { FreeCamera } from './FreeCamera';
import { GameEventListener } from '../listeners/GameEventListener';
import { KeyboardListener } from '../listeners/KeyboardListener';
import { MouseListener } from '../listeners/MouseListener';
import { OrbitCamera } from './OrbitCamera';

export interface CameraManagerBuildProps {
  canvasListener: CanvasListener;
  mouseListener: MouseListener;
  keyboardListener: KeyboardListener;
  gameEventListener: GameEventListener;
}

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  public controlSchemes: CameraControlScheme[] = [];
  public currentControlScheme: CameraControlScheme | undefined = undefined;

  constructor(private canvasListener: CanvasListener) {
    // Mobx
    makeObservable(this, {
      currentControlScheme: observable,
      currentSchemeName: computed,
      setControlScheme: action,
    });

    this.setupCamera();

    canvasListener.addCanvasListener(this.onCanvasResize);
  }

  public static build(buildProps: CameraManagerBuildProps) {
    // Create the camera manager, which creates the camera
    const cameraManager = new CameraManager(buildProps.canvasListener);

    // Use manager's camera to build the control schemes
    const orbitCamera = new OrbitCamera(
      cameraManager.camera,
      buildProps.canvasListener.canvas,
      buildProps.mouseListener,
      buildProps.keyboardListener,
      buildProps.gameEventListener
    );
    const freeCamera = new FreeCamera({
      camera: cameraManager.camera,
      canvasListener: buildProps.canvasListener,
      mouseListener: buildProps.mouseListener,
      keyboardListener: buildProps.keyboardListener,
      onExit: () => cameraManager.setControlScheme(CameraControlSchemeName.ORBIT),
    });

    // Give the controls schemes to manager
    cameraManager.setControlSchemes([orbitCamera, freeCamera]);

    // Activate orbit scheme by default
    cameraManager.setControlScheme(CameraControlSchemeName.ORBIT);

    return cameraManager;
  }

  public inFreeCamMode() {
    return this.currentSchemeName === CameraControlSchemeName.FREE;
  }

  public setControlSchemes(schemes: CameraControlScheme[]) {
    schemes.forEach((scheme) => this.controlSchemes.push(scheme));

    //this.currentControlScheme = this.controlSchemes[0];
  }

  public get currentSchemeName() {
    return this.currentControlScheme?.name ?? CameraControlSchemeName.ORBIT;
  }

  public setControlScheme = (name: CameraControlSchemeName) => {
    if (this.currentControlScheme?.name === name) {
      return;
    }

    this.currentControlScheme?.disable();

    const nextScheme = this.controlSchemes.find((scheme) => scheme.name === name);
    if (!nextScheme) {
      return;
    }

    this.currentControlScheme = nextScheme;
    this.currentControlScheme.enable();
  };

  public update(deltaTime: number) {
    this.currentControlScheme?.update(deltaTime);
  }

  private setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      this.canvasListener.width / this.canvasListener.height,
      0.1,
      1000
    );
    camera.position.x = 8;
    camera.position.y = 15;
    camera.position.z = 8;
    this.camera = camera;
  }

  private onCanvasResize = () => {
    this.camera.aspect = this.canvasListener.width / this.canvasListener.height;
    this.camera.updateProjectionMatrix();
  };
}
