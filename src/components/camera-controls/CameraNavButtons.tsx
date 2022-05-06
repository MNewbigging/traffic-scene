import './camera-nav-buttons.scss';

import React from 'react';

import { CameraMode } from '../../state/CameraManager';

interface CameraNavButtonsProps {
  currentMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
}

export const CameraNavButtons: React.FC<CameraNavButtonsProps> = ({
  currentMode,
  setCameraMode,
}) => {
  const orbitActiveClass = currentMode === CameraMode.ORBIT ? 'active' : '';
  const freeActiveClass = currentMode === CameraMode.FREE ? 'active' : '';

  return (
    <div className={'camera-nav-buttons'}>
      <div className={'button ' + orbitActiveClass} onClick={() => setCameraMode(CameraMode.ORBIT)}>
        Orbit
      </div>
      <div
        id={'free-cam-button'}
        className={'button ' + freeActiveClass}
        onClick={() => setCameraMode(CameraMode.FREE)}
      >
        Free
      </div>
    </div>
  );
};
