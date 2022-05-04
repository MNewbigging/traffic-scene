import './app.scss';

import React from 'react';

import { AppState } from './AppState';
import { GameClock } from './components/game-clock/GameClock';

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
    console.log('render game ui!');
    return (
      <>
        <GameClock worldClock={this.appState.worldClock} />
      </>
    );
  };
}
