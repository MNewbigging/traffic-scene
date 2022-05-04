import * as THREE from 'three';
import { makeObservable, observable, action, computed } from 'mobx';

export class WorldClock {
  public clock = new THREE.Clock();
  public paused = false;
  public timeModifier = 1;
  public hours = 0;
  public minutes = 0;
  public timePickerOpen = false;
  private deltaAccumulator = 0;

  constructor() {
    // MobX
    makeObservable(this, {
      paused: observable,
      pause: action,
      resume: action,
      timeModifier: observable,
      isFastForwardActive: computed,
      toggleFastForward: action,
      hours: observable,
      minutes: observable,
      update: action,
      timePickerOpen: observable,
      toggleTimePicker: action,
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

  public toggleTimePicker = () => {
    this.timePickerOpen = !this.timePickerOpen;
  };

  public setTime(hours: number) {}

  public update(deltaTime: number) {
    // Use delta time to accumulate in-game time
    this.deltaAccumulator += deltaTime;

    // Tick over to midnight
    if (this.deltaAccumulator > 1439) {
      this.deltaAccumulator = 0;
    }

    // In game hours and real-world minutes
    this.hours = Math.floor(this.deltaAccumulator / 60);

    // In game mins are real-world seconds
    this.minutes = Math.floor(this.deltaAccumulator % 60);
  }

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && !this.paused) {
      this.clock.stop();
    } else if (!this.paused) {
      this.clock.start();
    }
  };
}
