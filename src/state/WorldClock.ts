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
  private timeModifier = 1;

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  public get delta() {
    return this.clock.getDelta() * this.timeModifier;
  }

  public pause = () => {
    this.clock.stop();
    this.userPaused = true;
  };

  public resume = () => {
    this.clock.start();
    this.userPaused = false;
  };

  // TODO - toggle fast forward on/off? have separate levels?
  public toggleFastForward = () => {
    if (this.userPaused) {
      this.resume();
    }

    // Speed up delta time
    this.timeModifier = 2;
  };

  public update(deltaTime: number) {}

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && !this.userPaused) {
      this.clock.stop();
    } else if (!this.userPaused) {
      this.clock.start();
    }
  };
}
