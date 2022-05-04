import './game-clock.scss';
import pauseImg from '../../../public/assets/images/pause.png';
import resumeImg from '../../../public/assets/images/forward.png';
import fastForwardImg from '../../../public/assets/images/fastForward.png';

import React from 'react';

interface GameClockProps {
  onPause: () => void;
  onResume: () => void;
  onFastForward: () => void;
}

interface GameClockState {
  paused: boolean;
  ffActive: boolean;
}

export class GameClock extends React.Component<GameClockProps, GameClockState> {
  state: Readonly<GameClockState> = { paused: false, ffActive: false };

  public render() {
    const ffActiveClass = this.state.ffActive ? 'active' : '';

    return (
      <div className='game-clock'>
        <img
          className={'icon'}
          onClick={this.togglePause}
          src={this.state.paused ? resumeImg : pauseImg}
        ></img>
        <img
          className={'icon ' + ffActiveClass}
          onClick={this.toggleFastForward}
          src={fastForwardImg}
        ></img>
      </div>
    );
  }

  private togglePause = () => {
    const { onPause, onResume } = this.props;

    // If currently paused, now resuming
    if (this.state.paused) {
      onResume();
    } else {
      onPause();
    }

    this.setState((state) => ({ paused: !state.paused }));
  };

  private toggleFastForward = () => {
    const { onFastForward } = this.props;

    onFastForward();

    this.setState((state) => ({ ffActive: !state.ffActive }));
  };
}
