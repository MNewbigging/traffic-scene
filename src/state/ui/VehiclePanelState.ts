import { action, makeObservable, observable } from 'mobx';

import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { Vehicle } from '../../model/Vehicle';

export enum VehicleViewMode {
  LOOK_AT = 'Look at',
  FOLLOW = 'Follow',
  BONNET = 'Bonnet',
}

export class VehiclePanelState {
  public focusedVehicle?: Vehicle = undefined;
  public viewMode?: VehicleViewMode = undefined;

  constructor(private gameEventListener: GameEventListener) {
    makeObservable(this, {
      focusedVehicle: observable,
      onSelectVehicle: action,
      closeVehiclePanel: action,
      viewMode: observable,
      setViewMode: action,
    });

    gameEventListener.on(GameEventType.VEHICLE_SELECT, this.onSelectVehicle);
    gameEventListener.on(GameEventType.DOUBLE_CLICK_OBJECT, this.closeVehiclePanel);
  }

  public getModeActiveClassname(mode: VehicleViewMode) {
    return this.viewMode === mode ? 'active' : '';
  }

  public onSelectVehicle = (gameEvent: GameEvent) => {
    if (gameEvent.type !== GameEventType.VEHICLE_SELECT) {
      return;
    }

    this.focusedVehicle = gameEvent.vehicle;
    this.viewMode = VehicleViewMode.LOOK_AT;
  };

  public setViewMode = (mode: VehicleViewMode) => {
    this.viewMode = mode;
  };

  public closeVehiclePanel = () => {
    this.focusedVehicle = undefined;
  };
}
