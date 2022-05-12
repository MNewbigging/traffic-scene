import * as THREE from 'three';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { KeyboardListener } from '../listeners/KeyboardListener';
import { Vehicle } from '../../model/Vehicle';

export class FollowVehicleCam implements CameraControlScheme {
  public name = CameraControlSchemeName.FOLLOW_VEHICLE;
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

    // Move camera into position above and behind car
    const behind = vPos.clone().add(vDir.clone().multiplyScalar(-1));
    this.camera.position.set(behind.x, behind.y + 0.8, behind.z);

    // Look at car
    this.camera.lookAt(vPos);
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
