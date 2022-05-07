import './camera-nav-buttons.scss';

import React from 'react';

import { CameraControlSchemeName } from '../../model/CameraControlScheme';

interface CameraNavButtonsProps {
  currentMode: CameraControlSchemeName;
  setCameraMode: (mode: CameraControlSchemeName) => void;
}

export const CameraNavButtons: React.FC<CameraNavButtonsProps> = ({
  currentMode,
  setCameraMode,
}) => {
  const orbitActiveClass = currentMode === CameraControlSchemeName.ORBIT ? 'active' : '';
  const freeActiveClass = currentMode === CameraControlSchemeName.FREE ? 'active' : '';

  return (
    <div className={'camera-nav-buttons'}>
      <div
        className={'button ' + orbitActiveClass}
        onClick={() => setCameraMode(CameraControlSchemeName.ORBIT)}
      >
        Orbit
      </div>
      <div
        id={'free-cam-button'}
        className={'button ' + freeActiveClass}
        onClick={() => setCameraMode(CameraControlSchemeName.FREE)}
      >
        Free
      </div>
    </div>
  );
};
