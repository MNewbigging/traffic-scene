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
  private readonly lookSpeed = 1.6;
  private readonly minPolarAngle = 0;
  private readonly maxPolarAngle = Math.PI;
  private readonly normalSpeed = 3;
  private readonly fastSpeed = 10;

  constructor(private props: FreeCameraProps) {
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== props.canvasListener.canvas) {
        props.onExit();
      }
    });
  }

  public update(deltaTime: number) {
    this.getMouseLook();
    this.getKeyMovement(deltaTime);
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

    this.lookEuler.y -= movement.x * 0.002 * this.lookSpeed;
    this.lookEuler.x -= movement.y * 0.002 * this.lookSpeed;

    this.lookEuler.x = Math.max(
      this.halfPi - this.maxPolarAngle,
      Math.min(this.halfPi - this.minPolarAngle, this.lookEuler.x)
    );

    this.props.camera.quaternion.setFromEuler(this.lookEuler);
  }

  private getKeyMovement(deltaTime: number) {
    const kb = this.props.keyboardListener;
    const cam = this.props.camera;

    const forward = new THREE.Vector3();
    cam.getWorldDirection(forward);

    const rate = kb.isKeyPressed('shift') ? this.fastSpeed : this.normalSpeed;

    const moveSpeed = rate * deltaTime;

    // Forward
    if (kb.anyKeysPressed(['w', 'arrowup'])) {
      const moveStep = forward.clone().multiplyScalar(moveSpeed);
      cam.position.add(moveStep);
    }
    // Backward
    if (kb.anyKeysPressed(['s', 'arrowdown'])) {
      const moveStep = forward.clone().multiplyScalar(-moveSpeed);
      cam.position.add(moveStep);
    }
    // Left
    if (kb.anyKeysPressed(['a', 'arrowleft'])) {
      const leftDir = forward.clone().cross(cam.up);
      const moveStep = leftDir.multiplyScalar(-moveSpeed);
      cam.position.add(moveStep);
    }
    // Right
    if (kb.anyKeysPressed(['d', 'arrowright'])) {
      const leftDir = forward.clone().cross(cam.up);
      const moveStep = leftDir.multiplyScalar(moveSpeed);
      cam.position.add(moveStep);
    }
    // Up
    if (kb.isKeyPressed('q')) {
      const moveStep = cam.up.clone().multiplyScalar(moveSpeed);
      cam.position.add(moveStep);
    }
    // Down
    if (kb.isKeyPressed('e')) {
      const moveStep = cam.up.clone().multiplyScalar(-moveSpeed);
      cam.position.add(moveStep);
    }
  }
}
