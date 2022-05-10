import * as THREE from 'three';

import { CameraControlSchemeName } from '../../model/CameraControlScheme';
import { Vehicle } from '../../model/Vehicle';

export enum GameEventType {
  // User successfully double clicked on a road or prop
  DOUBLE_CLICK_OBJECT = 'double-click-object',
  // Request for camera manager to change to a new control scheme
  CAMERA_MODE_REQUEST = 'camera-mode-request',
  // Camera manager has changed to a new camera control scheme
  CAMERA_MODE_CHANGE = 'camera-mode-change',
  // User has clicked on a vehicle, selecting it
  VEHICLE_SELECT = 'vehicle-select',
}

export type GameEvent =
  | { type: GameEventType.DOUBLE_CLICK_OBJECT; intersectPos: THREE.Vector3 }
  | { type: GameEventType.CAMERA_MODE_REQUEST; scheme: CameraControlSchemeName }
  | { type: GameEventType.CAMERA_MODE_CHANGE; scheme: CameraControlSchemeName }
  | { type: GameEventType.VEHICLE_SELECT; vehicle: Vehicle };

export type A<T> = (props: T) => void;

export type GameEventCallback = (event: GameEvent) => void;

export class GameEventListener {
  private callbacks = new Map<GameEventType, GameEventCallback[]>();

  private cbs = new Map<GameEventType, A<any>[]>();

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

  public fire<T>(type: GameEventType, props: T) {
    const callbacks = this.cbs.get(type) ?? [];
    callbacks.forEach((cb) => cb(props));
  }
}
