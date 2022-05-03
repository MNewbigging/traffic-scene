import * as THREE from 'three';

export enum WorldClockRate {
  PAUSED = 'paused',
  NORMAL = 'normal',
  FAST = 'fast',
}

export class WorldClock {
  public rate = WorldClockRate.NORMAL;
  public clock = new THREE.Clock();
  private userPaused = false;

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  public get delta() {
    return this.clock.getDelta();
  }

  public pause = () => {
    this.clock.stop();
    this.userPaused = true;
  };

  public resume = () => {
    this.clock.start();
    this.userPaused = false;
  };

  public fastForward() {}

  public update(deltaTime: number) {}

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && !this.userPaused) {
      this.clock.stop();
    } else if (!this.userPaused) {
      this.clock.start();
    }
  };
}
