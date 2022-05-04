import * as THREE from 'three';

export class WorldClock {
  public clock = new THREE.Clock();
  public hours = 0;
  public minutes = 0;
  private deltaAccumulator = 0;
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

  public update(deltaTime: number) {
    // Use delta time to accumulate in-game time
    this.deltaAccumulator += deltaTime;

    const h = this.deltaAccumulator / 60;
    const m = this.deltaAccumulator % 60;
  }

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && !this.userPaused) {
      this.clock.stop();
    } else if (!this.userPaused) {
      this.clock.start();
    }
  };
}
