import React from 'react';
import { observer } from 'mobx-react-lite';

import { UIState } from '../../state/ui/UIState';
import { VehiclePanel } from './vehicle-panel/VehiclePanel';

interface InfoPanelsProps {
  uiState: UIState;
}

export const InfoPanels: React.FC<InfoPanelsProps> = observer(({ uiState }) => {
  const { vehiclePanelState } = uiState;

  return (
    <>
      {vehiclePanelState.focusedVehicle && <VehiclePanel vehiclePanelState={vehiclePanelState} />}
    </>
  );
});
