import './vehicle-panel.scss';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { VehiclePanelState, VehicleViewMode } from '../../../state/ui/VehiclePanelState';

interface VehiclePanelProps {
  vehiclePanelState: VehiclePanelState;
}

/**
 * UI Panel that shows when:
 * - selecting a vehicle
 *
 * It provides a few buttons:
 * - Look at - sets vehicle as orbit cam target, selects orbit cam mode
 * - Follow - selects follow cam mode targeting this vehicle
 * - Bonnet - selects bonnet cam mode, targeting this vehicle
 * - Close - closes the window
 *
 * The panel should close when:
 * - pressing Close
 * - losing focus of the vehicle (double click)
 * - entering free cam mode
 */
export const VehiclePanel: React.FC<VehiclePanelProps> = observer(({ vehiclePanelState }) => {
  const lookAtClass = vehiclePanelState.getModeActiveClassname(VehicleViewMode.LOOK_AT);
  const followClass = vehiclePanelState.getModeActiveClassname(VehicleViewMode.FOLLOW);
  const bonnetClass = vehiclePanelState.getModeActiveClassname(VehicleViewMode.BONNET);

  return (
    <div className={'vehicle-panel'}>
      <div
        className={'button ' + lookAtClass}
        onClick={() => vehiclePanelState.setViewMode(VehicleViewMode.LOOK_AT)}
      >
        Look at
      </div>
      <div
        className={'button ' + followClass}
        onClick={() => vehiclePanelState.setViewMode(VehicleViewMode.FOLLOW)}
      >
        Follow
      </div>
      <div
        className={'button ' + bonnetClass}
        onClick={() => vehiclePanelState.setViewMode(VehicleViewMode.BONNET)}
      >
        Bonnet
      </div>
      <div className={'button'} onClick={vehiclePanelState.closeVehiclePanel}>
        Close
      </div>
    </div>
  );
});
