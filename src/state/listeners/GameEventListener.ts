import { Vehicle } from '../../model/Vehicle';

export enum GameEventType {
  SELECTED_VEHICLE = 'selected-vehicle',
  GENERIC = 'another',
}

export type GameEvent =
  | { type: GameEventType.SELECTED_VEHICLE; vehicle: Vehicle }
  | { type: GameEventType.GENERIC; num: number };

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
