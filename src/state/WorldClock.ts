import * as THREE from 'three';

export class WorldClock {
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

    // Toggle between fast and normal rates
    if (this.timeModifier === 1) {
      this.timeModifier = 2;
    } else {
      this.timeModifier = 1;
    }
  };

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && !this.userPaused) {
      this.clock.stop();
    } else if (!this.userPaused) {
      this.clock.start();
    }
  };
}
