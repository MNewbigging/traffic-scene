import './vehicle-panel.scss';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { CameraControlSchemeName } from '../../../model/CameraControlScheme';
import { VehiclePanelState } from '../../../state/ui/VehiclePanelState';

interface VehiclePanelProps {
  vehiclePanelState: VehiclePanelState;
}

export const VehiclePanel: React.FC<VehiclePanelProps> = observer(({ vehiclePanelState }) => {
  const lookAtClass = vehiclePanelState.getModeActiveClassname(
    CameraControlSchemeName.LOOK_AT_VEHICLE
  );
  const followClass = vehiclePanelState.getModeActiveClassname(
    CameraControlSchemeName.FOLLOW_VEHICLE
  );
  const bonnetClass = vehiclePanelState.getModeActiveClassname(
    CameraControlSchemeName.BONNET_VEHICLE
  );

  return (
    <div className={'vehicle-panel'}>
      <div
        className={'button ' + lookAtClass}
        onClick={() => vehiclePanelState.setViewMode(CameraControlSchemeName.LOOK_AT_VEHICLE)}
      >
        Look at
      </div>
      <div
        className={'button ' + followClass}
        onClick={() => vehiclePanelState.setViewMode(CameraControlSchemeName.FOLLOW_VEHICLE)}
      >
        Follow
      </div>
      <div
        className={'button ' + bonnetClass}
        onClick={() => vehiclePanelState.setViewMode(CameraControlSchemeName.BONNET_VEHICLE)}
      >
        Bonnet
      </div>
      <div className={'button'} onClick={vehiclePanelState.closeVehiclePanel}>
        Close
      </div>
    </div>
  );
});
