import * as THREE from 'three';
import { makeObservable, observable, action, computed } from 'mobx';

export class WorldClock {
  public clock = new THREE.Clock();
  public paused = false;
  public timeModifier = 1;
  public hours = 0;
  public minutes = 0;
  private deltaAccumulator = 0;

  constructor() {
    // MobX
    makeObservable(this, {
      paused: observable,
      pause: action,
      timeModifier: observable,
      isFastForwardActive: computed,
      toggleFastForward: action,
    });

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  public get delta() {
    return this.clock.getDelta() * this.timeModifier;
  }

  public togglePause = () => {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  };

  public pause = () => {
    this.clock.stop();
    this.paused = true;
  };

  public resume = () => {
    this.clock.start();
    this.paused = false;
  };

  public get isFastForwardActive() {
    return this.timeModifier === 2;
  }

  public toggleFastForward = () => {
    if (this.paused) {
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
    if (document.visibilityState === 'hidden' && !this.paused) {
      this.clock.stop();
    } else if (!this.paused) {
      this.clock.start();
    }
  };
}
