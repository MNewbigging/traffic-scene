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
    this.keyboardListener.on('escape', this.forceExitMode);
  }

  public disable() {
    this.keyboardListener.off('escape', this.forceExitMode);
    this.targetVehicle = undefined;
  }

  private targetSelectedVehicle = (gameEvent: GameEvent<GameEventType.VEHICLE_SELECT>) => {
    this.targetVehicle = gameEvent.vehicle;

    // Snap camera position to above and behind vehicle
  };

  private forceExitMode = () => {
    // Stop this camera mode; request change to default orbit mode
    this.gameEventListener.fireEvent({
      type: GameEventType.CAMERA_MODE_REQUEST,
      scheme: CameraControlSchemeName.ORBIT,
    });
  };
}
