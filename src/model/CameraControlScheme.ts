export enum CameraControlSchemeName {
  ORBIT = 'orbit',
  FREE = 'free',
}

export interface CameraControlScheme {
  // Each control scheme has a name
  name: CameraControlSchemeName;

  // Update loop for the sceheme
  update: (deltaTime: number) => void;

  // Start up this controls scheme
  enable: () => void;

  // Stop the scheme
  disable: () => void;
}
