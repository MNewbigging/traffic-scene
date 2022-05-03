import './app.scss';

import React from 'react';

import { AppState } from './AppState';
import { GameClock } from './components/game-clock/GameClock';

export class App extends React.Component {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private appState: AppState;

  componentDidMount() {
    if (this.canvasRef.current) {
      this.appState = new AppState(this.canvasRef.current);
      console.log('set app state');
      this.render();
    }
  }

  public render() {
    console.log('app render', this.appState);
    return (
      <div className={'app'}>
        <canvas className={'main-canvas'} ref={this.canvasRef}></canvas>
        {this.appState && this.renderGameUI()}
        <div>THIS RENDERS</div>
      </div>
    );
  }

  private renderGameUI = () => {
    console.log('render game ui!');
    return (
      <>
        <div>HELLO THERE</div>
        <GameClock
          onPause={this.appState.worldClock.pause}
          onResume={this.appState.worldClock.resume}
        />
      </>
    );
  };
}
