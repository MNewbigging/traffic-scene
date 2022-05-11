import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { KeyboardListener } from '../listeners/KeyboardListener';
import { Vehicle } from '../../model/Vehicle';

export class LookAtVehicleCam implements CameraControlScheme {
  public name = CameraControlSchemeName.LOOK_AT_VEHICLE;
  private orbitControls: OrbitControls;
  private targetVehicle?: Vehicle;

  constructor(
    private camera: THREE.PerspectiveCamera,
    private canvas: HTMLCanvasElement,
    private keyboardListener: KeyboardListener,
    private gameEventListener: GameEventListener
  ) {
    // Setup controls
    this.orbitControls = new OrbitControls(camera, canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.enablePan = false;
    this.orbitControls.enabled = false;

    // Always listen for newly selected vehicles
    this.gameEventListener.on(GameEventType.VEHICLE_SELECT, this.targetSelectedVehicle);
  }

  public update(_deltaTime: number) {
    this.orbitControls.update();

    this.orbitControls.target.x = this.targetVehicle.position.x;
    this.orbitControls.target.y = this.targetVehicle.position.y;
    this.orbitControls.target.z = this.targetVehicle.position.z;
  }

  public enable() {
    this.keyboardListener.on('escape', this.forceExitMode);
    this.orbitControls.enabled = true;
  }

  public disable() {
    this.keyboardListener.off('escape', this.forceExitMode);
    this.targetVehicle = undefined;
    this.orbitControls.enabled = false;
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
