import { CameraControlSchemeName } from '../../model/CameraControlScheme';
import { CameraManager } from './CameraManager';
import { CanvasListener } from '../listeners/CanvasListener';
import { FreeCamera } from './FreeCamera';
import { GameEventListener } from '../listeners/GameEventListener';
import { KeyboardListener } from '../listeners/KeyboardListener';
import { LookAtVehicleCam } from './LookAtVehicleCam';
import { MouseListener } from '../listeners/MouseListener';
import { OrbitCamera } from './OrbitCamera';

export interface CameraManagerBuildProps {
  canvasListener: CanvasListener;
  mouseListener: MouseListener;
  keyboardListener: KeyboardListener;
  gameEventListener: GameEventListener;
}

export class CameraFactory {
  public static buildCameraManager(buildProps: CameraManagerBuildProps) {
    // Create the camera manager, which creates the camera
    const cameraManager = new CameraManager(
      buildProps.canvasListener,
      buildProps.gameEventListener
    );

    // Use manager's camera to build the control schemes
    const orbitCamera = new OrbitCamera(
      cameraManager.camera,
      buildProps.canvasListener.canvas,
      buildProps.mouseListener,
      buildProps.keyboardListener,
      buildProps.gameEventListener
    );
    const freeCamera = new FreeCamera({
      camera: cameraManager.camera,
      canvasListener: buildProps.canvasListener,
      mouseListener: buildProps.mouseListener,
      keyboardListener: buildProps.keyboardListener,
      onExit: () => cameraManager.setControlScheme(CameraControlSchemeName.ORBIT),
    });
    const lookAtVehicleCam = new LookAtVehicleCam(
      cameraManager.camera,
      buildProps.canvasListener.canvas,
      buildProps.mouseListener,
      buildProps.keyboardListener,
      buildProps.gameEventListener
    );

    // Give the controls schemes to manager
    [orbitCamera, freeCamera, lookAtVehicleCam].forEach((scheme) =>
      cameraManager.controlSchemes.push(scheme)
    );

    // Activate orbit scheme by default
    cameraManager.setControlScheme(CameraControlSchemeName.ORBIT);

    return cameraManager;
  }
}
