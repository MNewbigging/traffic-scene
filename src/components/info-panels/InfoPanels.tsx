import React from 'react';
import { observer } from 'mobx-react-lite';

import { UIState } from '../../state/UIState';
import { VehiclePanel } from './vehicle-panel/VehiclePanel';

interface InfoPanelsProps {
  uiState: UIState;
}

export const InfoPanels: React.FC<InfoPanelsProps> = observer(({ uiState }) => {
  return (
    <>
      {uiState.focusedVehicle && (
        <VehiclePanel vehicle={uiState.focusedVehicle} onClose={uiState.closeVehiclePanel} />
      )}
    </>
  );
});
