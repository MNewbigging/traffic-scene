import './camera-nav-buttons.scss';

import React from 'react';

import { CameraControlSchemeName } from '../../state/cameras/CameraControlScheme';
import { GameEventListener, GameEventType } from '../../state/listeners/GameEventListener';

interface CameraNavButtonsProps {
  currentMode: CameraControlSchemeName;
  eventListener: GameEventListener;
}

export const CameraNavButtons: React.FC<CameraNavButtonsProps> = ({
  currentMode,
  eventListener,
}) => {
  const orbitActiveClass = currentMode === CameraControlSchemeName.ORBIT ? 'active' : '';
  const freeActiveClass = currentMode === CameraControlSchemeName.FREE ? 'active' : '';

  return (
    <div className={'camera-nav-buttons'}>
      <div
        className={'button ' + orbitActiveClass}
        onClick={() =>
          eventListener.fireEvent({
            type: GameEventType.CAMERA_MODE_REQUEST,
            scheme: CameraControlSchemeName.ORBIT,
          })
        }
      >
        Orbit
      </div>
      <div
        id={'free-cam-button'}
        className={'button ' + freeActiveClass}
        onClick={() =>
          eventListener.fireEvent({
            type: GameEventType.CAMERA_MODE_REQUEST,
            scheme: CameraControlSchemeName.FREE,
          })
        }
      >
        Free
      </div>
    </div>
  );
};
