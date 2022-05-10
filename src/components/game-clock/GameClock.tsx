import './game-clock.scss';

import React from 'react';
import { observer } from 'mobx-react-lite';

import fastForwardImg from '../../../public/assets/images/fastForward.png';
import pauseImg from '../../../public/assets/images/pause.png';
import resumeImg from '../../../public/assets/images/forward.png';
import { GameClockSetter } from './GameClockSetter';
import { WorldClock } from '../../state/WorldClock';

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

  const setClockActiveClass = worldClock.timePickerOpen ? 'active' : '';

  return (
    <div className='game-clock'>
      <img
        className={'button'}
        onClick={worldClock.togglePause}
        src={worldClock.paused ? resumeImg : pauseImg}
      ></img>

      <img
        className={'button ' + ffActiveClass}
        onClick={worldClock.toggleFastForward}
        src={fastForwardImg}
      ></img>

      <div className={'button ' + setClockActiveClass} onClick={worldClock.toggleTimePicker}>
        {hours}:{mins}
      </div>

      {worldClock.timePickerOpen && <GameClockSetter worldClock={worldClock} />}
    </div>
  );
});
