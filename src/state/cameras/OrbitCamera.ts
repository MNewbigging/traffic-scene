import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { Vehicle } from '../../model/Vehicle';

export class OrbitCamera implements CameraControlScheme {
  public name = CameraControlSchemeName.ORBIT;
  private orbitControls: OrbitControls;
  private targetVehicle?: Vehicle;

  constructor(
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement,
    private gameEventListener: GameEventListener
  ) {
    // Setup controls
    this.orbitControls = new OrbitControls(camera, canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.target.x = 8;
    this.orbitControls.target.z = -4;

    // Be notified when targeting cars
    gameEventListener.on(GameEventType.SELECTED_VEHICLE, this.targetSelectedVehicle);
  }

  public update(_deltaTime: number) {
    this.orbitControls.update();
  }

  public enable() {
    this.orbitControls.enabled = true;
  }

  public disable() {
    this.orbitControls.enabled = false;
  }

  private targetSelectedVehicle = (gameEvent: GameEvent) => {};
}
