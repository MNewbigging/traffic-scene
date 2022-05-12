import * as THREE from 'three';

import { CameraControlScheme, CameraControlSchemeName } from './CameraControlScheme';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { KeyboardListener } from '../listeners/KeyboardListener';
import { Vehicle } from '../../model/Vehicle';

export class BonnetVehicleCam implements CameraControlScheme {
  public name = CameraControlSchemeName.BONNET_VEHICLE;
  private targetVehicle?: Vehicle;

  constructor(
    private camera: THREE.PerspectiveCamera,
    private keyboardListener: KeyboardListener,
    private gameEventListener: GameEventListener
  ) {
    // Always listen for newly selected vehicles
    this.gameEventListener.on(GameEventType.VEHICLE_SELECT, this.targetSelectedVehicle);
  }

  public update(_deltaTime: number) {
    const vPos = this.targetVehicle.position;

    // Vehicle direction
    const vDir = new THREE.Vector3();
    this.targetVehicle.model.getWorldDirection(vDir);

    const step = vDir.multiplyScalar(0.5);

    // Move camera into position above bonnet
    const bonnet = vPos.clone().add(step);
    this.camera.position.set(bonnet.x, bonnet.y + 0.2, bonnet.z);

    // Look ahead
    const target = bonnet.add(step);
    this.camera.lookAt(target);
  }

  public enable() {
    this.keyboardListener.on('escape', this.forceExitMode);
  }

  public disable() {
    this.keyboardListener.off('escape', this.forceExitMode);
  }

  private targetSelectedVehicle = (gameEvent: GameEvent<GameEventType.VEHICLE_SELECT>) => {
    this.targetVehicle = gameEvent.vehicle;
  };

  private forceExitMode = () => {
    // Stop this camera mode; request change to default orbit mode
    this.gameEventListener.fireEvent({
      type: GameEventType.CAMERA_MODE_REQUEST,
      scheme: CameraControlSchemeName.ORBIT,
    });
  };
}
