import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CameraControlScheme, CameraControlSchemeName } from './CameraControlScheme';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';

export class OrbitCamera implements CameraControlScheme {
  public name = CameraControlSchemeName.ORBIT;
  private orbitControls: OrbitControls;
  private targetPoint = new THREE.Vector3(8, 0, -4);

  constructor(
    private camera: THREE.PerspectiveCamera,
    private canvas: HTMLCanvasElement,
    private gameEventListener: GameEventListener
  ) {
    // Setup controls
    this.orbitControls = new OrbitControls(camera, canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.target = this.targetPoint;
    this.orbitControls.enabled = false;
  }

  public update(_deltaTime: number) {
    this.orbitControls.update();
  }

  public enable() {
    this.gameEventListener.on(GameEventType.DOUBLE_CLICK_OBJECT, this.setTargetPoint);

    this.orbitControls.enabled = true;
  }

  public disable() {
    this.gameEventListener.off(GameEventType.DOUBLE_CLICK_OBJECT, this.setTargetPoint);

    this.orbitControls.enabled = false;
  }

  private setTargetPoint = (gameEvent: GameEvent<GameEventType.DOUBLE_CLICK_OBJECT>) => {
    this.targetPoint = gameEvent.intersectPos;
    this.orbitControls.target = this.targetPoint;
  };
}
