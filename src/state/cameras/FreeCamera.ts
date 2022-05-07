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
}

export class FreeCamera implements CameraControlScheme {
  public name = CameraControlSchemeName.FREE;

  constructor(private props: FreeCameraProps) {}

  public update(deltaTime: number) {}

  public enable() {}

  public disable() {}
}
