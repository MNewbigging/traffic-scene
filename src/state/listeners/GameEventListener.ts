import * as THREE from 'three';

import { Vehicle } from '../../model/Vehicle';

export enum GameEventType {
  SELECT_VEHICLE = 'select-vehicle',
  DOUBLE_CLICK_OBJECT = 'double-click-object',
}

export type GameEvent =
  | { type: GameEventType.SELECT_VEHICLE; vehicle: Vehicle }
  | { type: GameEventType.DOUBLE_CLICK_OBJECT; intersectPos: THREE.Vector3 };

export type GameEventCallback = (event: GameEvent) => void;

export class GameEventListener {
  private callbacks = new Map<GameEventType, GameEventCallback[]>();

  public on(eventType: GameEventType, callback: GameEventCallback) {
    const existing = this.callbacks.get(eventType) ?? [];
    existing.push(callback);
    this.callbacks.set(eventType, existing);
  }

  public off(eventType: GameEventType, callback: GameEventCallback) {
    let existing = this.callbacks.get(eventType) ?? [];
    if (existing.length) {
      existing = existing.filter((cb) => cb !== callback);
      this.callbacks.set(eventType, existing);
    }
  }

  public fireEvent(event: GameEvent) {
    const listeners = this.callbacks.get(event.type) ?? [];
    listeners.forEach((cb) => cb(event));
  }
}
