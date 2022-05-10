import { action, makeObservable, observable } from 'mobx';

import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { Vehicle } from '../../model/Vehicle';

export class VehiclePanelState {
  public focusedVehicle?: Vehicle = undefined;

  constructor(private gameEventListener: GameEventListener) {
    makeObservable(this, {
      focusedVehicle: observable,
      onSelectVehicle: action,
      closeVehiclePanel: action,
    });

    gameEventListener.on(GameEventType.SELECT_VEHICLE, this.onSelectVehicle);
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
