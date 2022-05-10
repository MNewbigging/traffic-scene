import { GameEventListener } from '../listeners/GameEventListener';
import { VehiclePanelState } from './VehiclePanelState';

// Holds observables to toggle various UI elements
export class UIState {
  public vehiclePanelState: VehiclePanelState;

  constructor(private gameEventListener: GameEventListener) {
    this.vehiclePanelState = new VehiclePanelState(gameEventListener);
  }
}
