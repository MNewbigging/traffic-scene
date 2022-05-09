import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { KeyboardListener } from '../listeners/KeyboardListener';
import { MouseListener } from '../listeners/MouseListener';
import { Vehicle } from '../../model/Vehicle';

export class OrbitCamera implements CameraControlScheme {
  public name = CameraControlSchemeName.ORBIT;
  private orbitControls: OrbitControls;
  private targetVehicle?: Vehicle;
  private targetPoint = new THREE.Vector3(8, 0, -4);

  constructor(
    private camera: THREE.PerspectiveCamera,
    private canvas: HTMLCanvasElement,
    private mouseListener: MouseListener,
    private keyboardListener: KeyboardListener,
    private gameEventListener: GameEventListener
  ) {
    // Setup controls
    this.orbitControls = new OrbitControls(camera, canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.target = this.targetPoint;
  }

  public update(_deltaTime: number) {
    this.orbitControls.update();

    if (this.targetVehicle) {
      this.orbitControls.target.x = this.targetVehicle.position.x;
      this.orbitControls.target.y = this.targetVehicle.position.y;
      this.orbitControls.target.z = this.targetVehicle.position.z;
    }
  }

  public enable() {
    this.mouseListener.on('rightclickdown', this.removeTargetVehicle);
    this.keyboardListener.on('escape', this.removeTargetVehicle);
    this.gameEventListener.on(GameEventType.SELECT_VEHICLE, this.targetSelectedVehicle);
    this.gameEventListener.on(GameEventType.DOUBLE_CLICK_OBJECT, this.setTargetPoint);

    this.orbitControls.enabled = true;
  }

  public disable() {
    this.mouseListener.off('rightclickdown', this.removeTargetVehicle);
    this.keyboardListener.off('escape', this.removeTargetVehicle);
    this.gameEventListener.off(GameEventType.SELECT_VEHICLE, this.targetSelectedVehicle);
    this.gameEventListener.off(GameEventType.DOUBLE_CLICK_OBJECT, this.setTargetPoint);

    this.removeTargetVehicle();
    this.orbitControls.enabled = false;
  }

  private setTargetPoint = (gameEvent: GameEvent) => {
    if (gameEvent.type !== GameEventType.DOUBLE_CLICK_OBJECT) {
      return;
    }

    this.targetPoint = gameEvent.intersectPos;
    this.orbitControls.target = this.targetPoint;
    this.removeTargetVehicle();
  };

  private targetSelectedVehicle = (gameEvent: GameEvent) => {
    if (gameEvent.type !== GameEventType.SELECT_VEHICLE) {
      return;
    }

    this.targetVehicle = gameEvent.vehicle;
  };

  private removeTargetVehicle = () => {
    this.targetVehicle = undefined;
  };
}
