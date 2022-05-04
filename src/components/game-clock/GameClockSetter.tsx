import './game-clock-setter.scss';

import React from 'react';
import { RangeSlider } from '../common/RangeSlider';
import { WorldClock } from '../../state/WorldClock';
import { observer } from 'mobx-react-lite';

interface GameClockSetterProps {
  worldClock: WorldClock;
}

export const GameClockSetter: React.FC<GameClockSetterProps> = observer(({ worldClock }) => {
  return (
    <div className={'game-clock-setter'}>
      00:00
      <RangeSlider
        className={'game-clock-slider'}
        min={0}
        max={1439}
        value={Math.floor(worldClock.deltaAccumulator)}
        onChange={worldClock.setTime}
      />
      23:59
    </div>
  );
});
