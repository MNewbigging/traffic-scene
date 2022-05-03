import './game-clock.scss';
import pauseImg from '../../../public/assets/images/pause.png';
import resumeImg from '../../../public/assets/images/forward.png';

import React from 'react';

interface GameClockProps {
  onPause: () => void;
  onResume: () => void;
}

interface GameClockState {
  paused: boolean;
}

export class GameClock extends React.Component<GameClockProps, GameClockState> {
  state: Readonly<GameClockState> = { paused: false };

  public render() {
    return (
      <div className='game-clock'>
        <img
          className='icon'
          onClick={this.togglePause}
          src={this.state.paused ? resumeImg : pauseImg}
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
}