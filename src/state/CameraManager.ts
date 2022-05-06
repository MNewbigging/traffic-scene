import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { action, makeObservable, observable } from 'mobx';

import { CanvasListener } from '../utils/CanvasListener';

export enum CameraMode {
  ORBIT = 'orbit',
  FREE = 'free',
}

export class CameraManager {
  public mode = CameraMode.ORBIT;
  public camera: THREE.PerspectiveCamera;
  private orbitControls: OrbitControls;
  private pointerLockControls: PointerLockControls;

  constructor(private canvasListener: CanvasListener, private scene: THREE.Scene) {
    // Mobx
    makeObservable(this, {
      mode: observable,
      setMode: action,
    });

    this.setupCamera();
    this.setupControls();

    canvasListener.addCanvasListener(this.onCanvasResize);
  }

  public linkButtons() {
    document.getElementById('free-cam-button').addEventListener('click', () => {
      this.pointerLockControls.lock();
    });
  }

  public setMode = (mode: CameraMode) => {
    if (this.mode === mode) {
      return;
    }

    // Disable the current mode
    this.disableMode(this.mode);

    // Enable the new mode
    this.enableMode(mode);

    this.mode = mode;
  };

  public update(_deltaTime: number) {
    this.orbitControls.update();
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

  private setupControls() {
    // Orbit
    this.orbitControls = new OrbitControls(this.camera, this.canvasListener.canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.target.x = 8;
    this.orbitControls.target.z = -4;

    // Pointer lock
    this.pointerLockControls = new PointerLockControls(this.camera, this.canvasListener.canvas);
  }

  private onCanvasResize = () => {
    this.camera.aspect = this.canvasListener.width / this.canvasListener.height;
    this.camera.updateProjectionMatrix();
  };

  private enableMode(mode: CameraMode) {
    switch (mode) {
      case CameraMode.ORBIT:
        this.orbitControls.enabled = true;
        break;
      case CameraMode.FREE:
        this.scene.add(this.pointerLockControls.getObject());
        //  this.pointerLockControls.lock();
        break;
    }
  }

  private disableMode(mode: CameraMode) {
    switch (mode) {
      case CameraMode.ORBIT:
        this.orbitControls.enabled = false;
        break;
      case CameraMode.FREE:
        this.scene.remove(this.pointerLockControls.getObject());
        this.pointerLockControls.unlock();
        break;
    }
  }
}
