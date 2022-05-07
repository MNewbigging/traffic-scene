import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CameraControlScheme, CameraControlSchemeName } from '../../model/CameraControlScheme';

export class OrbitCamera implements CameraControlScheme {
  public name = CameraControlSchemeName.ORBIT;
  private orbitControls: OrbitControls;

  constructor(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.orbitControls = new OrbitControls(camera, canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.target.x = 8;
    this.orbitControls.target.z = -4;
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
}
