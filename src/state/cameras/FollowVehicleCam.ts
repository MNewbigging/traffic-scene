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

  public update(deltaTime: number) {}

  public enable() {
    this.setFollowPosition();
    this.keyboardListener.on('escape', this.forceExitMode);
  }

  public disable() {
    this.targetVehicle.model.remove(this.camera);

    this.keyboardListener.off('escape', this.forceExitMode);
    this.targetVehicle = undefined;
  }

  private targetSelectedVehicle = (gameEvent: GameEvent<GameEventType.VEHICLE_SELECT>) => {
    this.targetVehicle = gameEvent.vehicle;
  };

  private setFollowPosition() {
    const v = this.targetVehicle.model;

    const forward = new THREE.Vector3();
    v.getWorldDirection(forward);

    const backward = forward.clone().multiplyScalar(-1);

    // Create the anchor point for the camera - above and behind vehicle
    const backPos = v.position.clone().add(backward.clone().multiplyScalar(0.2));
    backPos.y = this.targetVehicle.dimensions.y + 0.2;

    // Create the target point for the camera - in front of the vehicle
    const forwardPos = v.position.clone().add(forward.clone().multiplyScalar(0.2));
    forwardPos.y = v.position.y;

    // Set camera at back pos
    this.camera.position.set(v.position.x, v.position.y, v.position.z);

    // Camera looks at forward pos
    this.camera.lookAt(forwardPos);

    // Now attach camera to vehicle
    //v.add(this.camera);
  }

  private forceExitMode = () => {
    // Stop this camera mode; request change to default orbit mode
    this.gameEventListener.fireEvent({
      type: GameEventType.CAMERA_MODE_REQUEST,
      scheme: CameraControlSchemeName.ORBIT,
    });
  };
}
