import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { KeyboardListener } from '../listeners/KeyboardListener';
import { MouseListener } from '../listeners/MouseListener';
import { Vehicle } from '../../model/Vehicle';

export class LookAtVehicleCam implements CameraControlScheme {
  public name = CameraControlSchemeName.LOOK_AT_VEHICLE;
  private orbitControls: OrbitControls;
  private targetVehicle?: Vehicle;

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
    this.orbitControls.enablePan = false;

    // Always listen for newly selected vehicles
    this.gameEventListener.on(GameEventType.VEHICLE_SELECT, this.targetSelectedVehicle);
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
    //this.gameEventListener.on(GameEventType.VEHICLE_SELECT, this.targetSelectedVehicle);

    this.orbitControls.enabled = true;
  }

  public disable() {
    this.mouseListener.off('rightclickdown', this.removeTargetVehicle);
    this.keyboardListener.off('escape', this.removeTargetVehicle);
    //this.gameEventListener.off(GameEventType.VEHICLE_SELECT, this.targetSelectedVehicle);

    this.removeTargetVehicle();
    this.orbitControls.enabled = false;
  }

  private targetSelectedVehicle = (gameEvent: GameEvent<GameEventType.VEHICLE_SELECT>) => {
    this.targetVehicle = gameEvent.vehicle;

    console.log('look at set vehcile', this.targetVehicle);
  };

  private removeTargetVehicle = () => {
    this.targetVehicle = undefined;
  };
}
