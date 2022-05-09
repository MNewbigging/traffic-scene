import './vehicle-panel.scss';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { Vehicle } from '../../../model/Vehicle';

interface VehiclePanelProps {
  vehicle: Vehicle;
  onClose: () => void;
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
