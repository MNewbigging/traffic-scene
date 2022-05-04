import React from 'react';
import { observer } from 'mobx-react-lite';

import { WorldClock } from '../../state/WorldClock';

import './game-clock.scss';
import pauseImg from '../../../public/assets/images/pause.png';
import resumeImg from '../../../public/assets/images/forward.png';
import fastForwardImg from '../../../public/assets/images/fastForward.png';

interface GameClockProps {
  worldClock: WorldClock;
}

/**
 * Shows the game speed controls, current time and set time controls.
 */
export const GameClock: React.FC<GameClockProps> = observer(({ worldClock }) => {
  const ffActiveClass = worldClock.isFastForwardActive ? 'active' : '';

  let hours = worldClock.hours.toString();
  if (hours.length < 2) {
    hours = '0' + hours;
  }

  let mins = worldClock.minutes.toString();
  if (mins.length < 2) {
    mins = '0' + mins;
  }

  return (
    <div className='game-clock'>
      <img
        className={'icon'}
        onClick={worldClock.togglePause}
        src={worldClock.paused ? resumeImg : pauseImg}
      ></img>
      <img
        className={'icon ' + ffActiveClass}
        onClick={worldClock.toggleFastForward}
        src={fastForwardImg}
      ></img>
      <div className={'clock'}>
        {hours}:{mins}
      </div>
    </div>
  );
});
