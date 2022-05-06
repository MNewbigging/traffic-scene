import './app.scss';

import React from 'react';
import { observer } from 'mobx-react-lite';

import { AppState } from './AppState';
import { CameraNavButtons } from './components/camera-controls/CameraNavButtons';
import { GameClock } from './components/game-clock/GameClock';
import { TopNavbar } from './components/top-navbar/TopNavbar';

interface AppProps {
  appState: AppState;
}

export const App: React.FC<AppProps> = observer(({ appState }) => {
  const { loading, gameState } = appState;

  // Is this app still loading?
  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <>
      <TopNavbar>
        <CameraNavButtons
          currentMode={gameState.cameraManager.mode}
          setCameraMode={gameState.cameraManager.setMode}
        />
        <GameClock worldClock={gameState.worldClock} />
      </TopNavbar>
    </>
  );
});
