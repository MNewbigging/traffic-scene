import './game-clock-setter.scss';

import React from 'react';
import { RangeSlider } from '../common/RangeSlider';

export const GameClockSetter: React.FC = () => {
  return (
    <div className={'game-clock-setter'}>
      00:00
      <RangeSlider
        className={'game-clock-slider'}
        min={0}
        max={1439}
        value={719}
        onChange={(v) => console.log('value', v)}
      />
      23:59
    </div>
  );
};
