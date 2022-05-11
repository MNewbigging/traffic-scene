import * as THREE from 'three';
import { action, computed, makeObservable, observable } from 'mobx';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { CanvasListener } from '../listeners/CanvasListener';
import { GameEventListener } from '../listeners/GameEventListener';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  public controlSchemes: CameraControlScheme[] = [];
  public currentControlScheme: CameraControlScheme | undefined = undefined;

  constructor(
    private canvasListener: CanvasListener,
    private gameEventListener: GameEventListener
  ) {
    // Mobx
    makeObservable(this, {
      currentControlScheme: observable,
      currentSchemeName: computed,
      setControlScheme: action,
    });

    this.setupCamera();

    canvasListener.addCanvasListener(this.onCanvasResize);
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
