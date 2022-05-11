import { action, makeObservable, observable } from 'mobx';

import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';

export enum VehicleViewMode {
  LOOK_AT = 'Look at',
  FOLLOW = 'Follow',
  BONNET = 'Bonnet',
}

export class VehiclePanelState {
  public focusedVehicle = false;
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

  public onSelectVehicle = (gameEvent: GameEvent<GameEventType.VEHICLE_SELECT>) => {
    this.focusedVehicle = true;
  };

  public setViewMode = (mode: VehicleViewMode) => {
    this.viewMode = mode;

    switch (mode) {
      case VehicleViewMode.FOLLOW:
        break;
    }
  };

  public closeVehiclePanel = () => {
    this.focusedVehicle = undefined;
  };
}
