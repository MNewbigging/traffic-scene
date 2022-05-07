import * as THREE from 'three';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { CanvasListener } from '../listeners/CanvasListener';
import { MouseListener } from '../listeners/MouseListener';

export interface FreeCameraProps {
  camera: THREE.PerspectiveCamera;
  canvasListener: CanvasListener;
  mouseListener: MouseListener;
}

export class FreeCamera implements CameraControlScheme {
  public name = CameraControlSchemeName.FREE;

  constructor(private freeCameraProps: FreeCameraProps) {}

  public update(deltaTime: number) {}

  public enable() {}

  public disable() {}
}
