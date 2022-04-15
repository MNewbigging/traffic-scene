import './app.scss';

import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import { AppState } from './AppState';

@observer
export class App extends React.PureComponent {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  @observable private appState: AppState;

  componentDidMount() {
    if (this.canvasRef.current) {
      this.appState = new AppState(this.canvasRef.current);
    }
  }

  public render() {
    return (
      <div className={'app'}>
        <canvas className={'main-canvas'} ref={this.canvasRef}></canvas>
      </div>
    );
  }
}
