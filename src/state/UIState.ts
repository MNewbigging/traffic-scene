import { action, makeObservable, observable } from 'mobx';

import { GameEvent, GameEventListener, GameEventType } from './listeners/GameEventListener';
import { Vehicle } from '../model/Vehicle';

// Holds observables to toggle various UI elements
export class UIState {
  public focusedVehicle?: Vehicle = undefined;

  private gameEventListener?: GameEventListener;

  constructor() {
    makeObservable(this, {
      focusedVehicle: observable,
      onSelectVehicle: action,
      closeVehiclePanel: action,
    });
  }

  public setGameEventListener(gameEventListener: GameEventListener) {
    this.gameEventListener = gameEventListener;

    this.gameEventListener.on(GameEventType.SELECT_VEHICLE, this.onSelectVehicle);
  }

  public onSelectVehicle = (gameEvent: GameEvent) => {
    if (gameEvent.type !== GameEventType.SELECT_VEHICLE) {
      return;
    }

    this.focusedVehicle = gameEvent.vehicle;
    console.log('ui state vehice', this.focusedVehicle);
  };

  public closeVehiclePanel = () => {
    this.focusedVehicle = undefined;
  };
}
