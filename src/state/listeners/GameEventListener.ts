import * as THREE from 'three';

import { Vehicle } from '../../model/Vehicle';

export enum GameEventType {
  DOUBLE_CLICK_OBJECT = 'double-click-object',
  VEHICLE_SELECT = 'vehicle-select',
  VEHICLE_BONNET_CAM = 'enter-bonnet-cam',
}

export type GameEvent =
  | { type: GameEventType.DOUBLE_CLICK_OBJECT; intersectPos: THREE.Vector3 }
  | { type: GameEventType.VEHICLE_SELECT; vehicle: Vehicle }
  | { type: GameEventType.VEHICLE_BONNET_CAM; vehicle: Vehicle };

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
