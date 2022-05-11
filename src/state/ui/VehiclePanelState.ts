import { action, makeObservable, observable } from 'mobx';

import { CameraControlSchemeName } from '../../model/CameraControlScheme';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { Vehicle } from '../../model/Vehicle';

export class VehiclePanelState {
  public focusedVehicle?: Vehicle = undefined;
  public viewMode?: CameraControlSchemeName = undefined;

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

  public getModeActiveClassname(mode: CameraControlSchemeName) {
    return this.viewMode === mode ? 'active' : '';
  }

  // When user selects a vehicle, open the vehicle panel
  public onSelectVehicle = (gameEvent: GameEvent<GameEventType.VEHICLE_SELECT>) => {
    // Are we selecting a new vehicle?
    const selectedVehicleId = gameEvent.vehicle.id;
    if (this.focusedVehicle?.id === selectedVehicleId) {
      return;
    }

    // Revert view mode state for this new vehicle
    this.viewMode = undefined;
    // Should we also revert to orbit cam at this point?

    // The panel should open
    this.focusedVehicle = gameEvent.vehicle;
  };

  // When user selects a vehicle camera mode, request camera manager mode change
  public setViewMode = (scheme: CameraControlSchemeName) => {
    this.viewMode = scheme;

    // Send camera mode change request
    this.gameEventListener.fireEvent({ type: GameEventType.CAMERA_MODE_REQUEST, scheme });
  };

  // When user closes vehicle panel - should it go back to orbit cam?
  public closeVehiclePanel = () => {
    this.focusedVehicle = undefined;
  };
}
