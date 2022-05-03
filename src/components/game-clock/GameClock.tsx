import './game-clock.scss';
import pauseImg from '../../../public/assets/images/pause.png';
import resumeImg from '../../../public/assets/images/forward.png';

import React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

interface Props {
  onPause: () => void;
  onResume: () => void;
}

@observer
export class GameClock extends React.Component<Props> {
  @observable paused = false;

  public render() {
    console.log('game clock render');
    return (
      <div className='game-clock'>
        <img
          className='icon'
          onClick={this.togglePause}
          src={this.paused ? resumeImg : pauseImg}
        ></img>
      </div>
    );
  }

  private togglePause = () => {
    const { onPause, onResume } = this.props;

    this.paused = !this.paused;

    if (this.paused) {
      onPause();
    } else {
      onResume();
    }
  };
}
