import './vehicle-panel.scss';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { Vehicle } from '../../../model/Vehicle';

interface VehiclePanelProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const VehiclePanel: React.FC<VehiclePanelProps> = observer(({ vehicle }) => {
  return (
    <div className={'vehicle-panel'}>
      <div className={'button'}>Look at</div>
      <div className={'button'}>Follow</div>
      <div className={'button'}>Bonnet</div>
      <div className={'button'}>Close</div>
    </div>
  );
});
