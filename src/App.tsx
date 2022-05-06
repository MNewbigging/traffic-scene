import './app.scss';

import React from 'react';
import { Observer } from 'mobx-react-lite';

import { AppState } from './AppState';
import { CameraNavButtons } from './components/camera-controls/CameraNavButtons';
import { GameClock } from './components/game-clock/GameClock';
import { TopNavbar } from './components/top-navbar/TopNavbar';

interface AppCompState {
  ready: boolean;
}

export class App extends React.Component<{}, AppCompState> {
  state: Readonly<AppCompState> = { ready: false };
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private appState: AppState;

  componentDidMount() {
    if (this.canvasRef.current) {
      this.appState = new AppState(this.canvasRef.current);
      this.setState((_state) => ({ ready: true }));
    }
  }

  public render() {
    return (
      <div className={'app'}>
        <canvas className={'main-canvas'} ref={this.canvasRef}></canvas>
        {this.appState && this.renderGameUI()}
      </div>
    );
  }

  private renderGameUI = () => {
    return (
      <Observer>
        {() =>
          this.appState.loaded && (
            <TopNavbar>
              <CameraNavButtons
                currentMode={this.appState.cameraManager.mode}
                setCameraMode={this.appState.cameraManager.setMode}
              />
              <GameClock worldClock={this.appState.worldClock} />
            </TopNavbar>
          )
        }
      </Observer>
    );
  };
}
