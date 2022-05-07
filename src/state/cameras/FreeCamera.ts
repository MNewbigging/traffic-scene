import * as THREE from 'three';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { CanvasListener } from '../listeners/CanvasListener';
import { KeyboardListener } from '../listeners/KeyboardListener';
import { MouseListener } from '../listeners/MouseListener';

export interface FreeCameraProps {
  camera: THREE.PerspectiveCamera;
  canvasListener: CanvasListener;
  mouseListener: MouseListener;
  keyboardListener: KeyboardListener;
  onExit: () => void;
}

export class FreeCamera implements CameraControlScheme {
  public name = CameraControlSchemeName.FREE;
  private lookEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly halfPi = Math.PI / 2;
  private readonly lookSpeed = 1;
  private readonly minPolarAngle = 0;
  private readonly maxPolarAngle = Math.PI;

  constructor(private props: FreeCameraProps) {
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== props.canvasListener.canvas) {
        props.onExit();
      }
    });
  }

  public update(deltaTime: number) {
    this.getMouseLook();
  }

  public enable() {
    this.props.canvasListener.canvas.requestPointerLock();
  }

  public disable() {
    document.exitPointerLock();
  }

  private getMouseLook() {
    const movement = this.props.mouseListener.movement;

    this.lookEuler.setFromQuaternion(this.props.camera.quaternion);

    this.lookEuler.y -= movement.x * 0.002;
    this.lookEuler.x -= movement.y * 0.002;

    this.lookEuler.x = Math.max(
      this.halfPi - this.maxPolarAngle,
      Math.min(this.halfPi - this.minPolarAngle, this.lookEuler.x)
    );

    this.props.camera.quaternion.setFromEuler(this.lookEuler);
  }
}
