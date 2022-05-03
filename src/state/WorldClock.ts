import * as THREE from 'three';

export enum WorldClockRate {
  PAUSED = 'paused',
  NORMAL = 'normal',
  FAST = 'fast',
}

export class WorldClock {
  public rate = WorldClockRate.NORMAL;
  public clock = new THREE.Clock();
  private autoPause = false;

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  public get delta() {
    return this.clock.getDelta();
  }

  public pause() {}

  public resume() {}

  public fastForward() {}

  public update(deltaTime: number) {}

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.clock.stop();
      this.autoPause = true;
    } else if (this.autoPause) {
      this.clock.start();
      this.autoPause = false;
    }
  };
}
